// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IntentForge
 * @dev Role-based restricted fund logic.
 *      Lender (Account 0) locks ETH with time-expiry rules.
 *      Receiver (Account 1) can only claim if rule conditions pass.
 *      All enforcement happens on-chain - frontend has zero role in validation.
 */
contract IntentForge {

    // --- Data Structures ---------------------------------------------

    struct IntentRule {
        address sender;    // Lender who locked the funds
        address receiver;  // Restricted user who may claim
        uint256 amount;    // ETH amount locked (wei)
        uint256 expiry;    // Unix timestamp - claim must happen by this time
        bool    active;    // false after claim or if cancelled
    }

    // --- State --------------------------------------------------------

    /// @notice ruleId -> IntentRule
    mapping(bytes32 => IntentRule) public rules;

    /// @notice address -> list of rule IDs involving that address
    mapping(address => bytes32[]) private _userRules;

    // --- Events -------------------------------------------------------

    event IntentCreated(
        bytes32 indexed ruleId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 expiry
    );

    event IntentClaimed(
        bytes32 indexed ruleId,
        address indexed receiver,
        uint256 amount
    );

    // --- Lender Functions ---------------------------------------------

    /**
     * @notice Create a restricted intent and lock ETH inside the contract.
     * @param _receiver  Address allowed to claim these funds.
     * @param _expiry    Unix timestamp after which the funds can no longer be claimed.
     *
     * Requirements:
     *  - msg.value > 0
     *  - _receiver is not zero address
     *  - _receiver is not the caller
     *  - _expiry is strictly in the future
     */
    function createIntent(address _receiver, uint256 _expiry) external payable {
        require(msg.value > 0,                  "Must send ETH");
        require(_receiver != address(0),        "Invalid receiver address");
        require(_receiver != msg.sender,        "Cannot send to yourself");
        require(_expiry > block.timestamp,      "Expiry must be in the future");

        bytes32 ruleId = keccak256(
            abi.encodePacked(msg.sender, _receiver, block.timestamp, msg.value)
        );

        // Collision guard (extremely unlikely, but safe)
        require(rules[ruleId].amount == 0, "Rule ID collision - try again");

        rules[ruleId] = IntentRule({
            sender:   msg.sender,
            receiver: _receiver,
            amount:   msg.value,
            expiry:   _expiry,
            active:   true
        });

        _userRules[msg.sender].push(ruleId);
        _userRules[_receiver].push(ruleId);

        emit IntentCreated(ruleId, msg.sender, _receiver, msg.value, _expiry);
    }

    // --- Receiver Functions -------------------------------------------

    /**
     * @notice Claim locked ETH.  Only the designated receiver may call this,
     *         and only while the rule is active and before expiry.
     * @param ruleId  The bytes32 identifier returned by createIntent.
     *
     * Requirements:
     *  - msg.sender == rule.receiver  (enforced on-chain)
     *  - rule.active == true
     *  - block.timestamp <= rule.expiry
     */
    function claimIntent(bytes32 ruleId) external {
        IntentRule storage rule = rules[ruleId];

        require(rule.amount > 0,                    "Rule does not exist");
        require(rule.receiver == msg.sender,        "Only the designated receiver can claim");
        require(rule.active,                        "Rule is no longer active");
        require(block.timestamp <= rule.expiry,     "Rule has expired");

        // Mark inactive before transfer (reentrancy guard pattern)
        rule.active = false;
        uint256 amount = rule.amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit IntentClaimed(ruleId, msg.sender, amount);
    }

    // --- View Functions -----------------------------------------------

    /**
     * @notice Returns all rule IDs where the given address is sender or receiver.
     */
    function getUserRules(address user) external view returns (bytes32[] memory) {
        return _userRules[user];
    }

    /**
     * @notice Returns the full IntentRule struct for a given rule ID.
     */
    function getRule(bytes32 ruleId) external view returns (
        address sender,
        address receiver,
        uint256 amount,
        uint256 expiry,
        bool    active
    ) {
        IntentRule memory r = rules[ruleId];
        return (r.sender, r.receiver, r.amount, r.expiry, r.active);
    }

    /**
     * @notice Returns human-readable status of a rule.
     * @return "ACTIVE" | "CLAIMED" | "EXPIRED" | "NOT_FOUND"
     */
    function getRuleStatus(bytes32 ruleId) external view returns (string memory) {
        IntentRule memory r = rules[ruleId];
        if (r.amount == 0)          return "NOT_FOUND";
        if (!r.active)              return "CLAIMED";
        if (block.timestamp > r.expiry) return "EXPIRED";
        return "ACTIVE";
    }

    /**
     * @notice Total ETH currently locked inside this contract.
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
