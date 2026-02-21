// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IntentForgeAudit
 * @dev Financial Integrity & Audit Infrastructure for Programmable Digital Rupee
 * @notice This contract provides immutable audit logging for policy enforcement,
 *         transaction validation, violation recording, and clawback tracking.
 *         It is NOT a DeFi token - it's a compliance-grade governance backbone.
 */
contract IntentForgeAudit is Ownable {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Backend service account authorized to log transactions
    address public backendServiceAccount;

    /// @notice Contract version for upgrade tracking
    string public constant VERSION = "1.0.0";

    // ============================================
    // DATA STRUCTURES
    // ============================================

    /**
     * @dev Policy Registration Structure
     * @notice Stores tamper-proof policy metadata on-chain
     */
    struct Policy {
        string walletId; // Unique wallet identifier
        bytes32 policyHash; // keccak256 hash of policy JSON
        uint256 timestamp; // Policy registration timestamp
        address deployedBy; // Account that deployed the policy
        bool isActive; // Policy activation status
    }

    /**
     * @dev Transaction Validation Log Structure
     * @notice Records validation decisions for auditability
     */
    enum Decision {
        APPROVED,
        BLOCKED,
        VIOLATION
    }

    struct TransactionLog {
        string walletId; // Wallet initiating transaction
        string txId; // Unique transaction identifier
        Decision decision; // Validation outcome
        bytes32 policyHash; // Policy applied during validation
        uint256 timestamp; // Log timestamp
        address loggedBy; // Backend service that logged
    }

    /**
     * @dev Violation Record Structure
     * @notice Stores compliance violation details
     */
    struct ViolationRecord {
        string txId; // Transaction ID that violated policy
        bytes32 reasonHash; // Hash of violation reason/details
        string penaltyApplied; // Description of penalty applied
        uint256 timestamp; // Violation timestamp
        address recordedBy; // Backend service that recorded
    }

    /**
     * @dev Clawback Execution Structure
     * @notice Stores transaction reversal details
     */
    struct ClawbackRecord {
        string originalTxId; // Original transaction being reversed
        string clawbackTxId; // Clawback transaction ID
        bytes32 reasonHash; // Hash of clawback reason
        uint256 timestamp; // Clawback timestamp
        address executedBy; // Backend service that executed
    }

    /// @notice Mapping from walletId hash to Policy
    mapping(bytes32 => Policy) public policies;

    /// @notice Mapping from txId hash to TransactionLog
    mapping(bytes32 => TransactionLog) public transactionLogs;

    /// @notice Mapping from txId hash to ViolationRecord
    mapping(bytes32 => ViolationRecord) public violationRecords;

    /// @notice Mapping from clawbackTxId hash to ClawbackRecord
    mapping(bytes32 => ClawbackRecord) public clawbackRecords;

    /// @notice Counter for total policies registered
    uint256 public totalPolicies;

    /// @notice Counter for total transactions logged
    uint256 public totalTransactionsLogged;

    /// @notice Counter for total violations recorded
    uint256 public totalViolations;

    /// @notice Counter for total clawbacks executed
    uint256 public totalClawbacks;

    // ============================================
    // EVENTS
    // ============================================

    /// @notice Emitted when backend service account is updated
    event BackendServiceAccountUpdated(
        address indexed oldAccount,
        address indexed newAccount
    );

    /// @notice Emitted when a new policy is registered
    event PolicyRegistered(
        string indexed walletId,
        bytes32 indexed policyHash,
        uint256 timestamp,
        address indexed deployedBy
    );

    /// @notice Emitted when a transaction validation is logged
    event TransactionLogged(
        string indexed walletId,
        string indexed txId,
        Decision decision,
        bytes32 policyHash,
        uint256 timestamp
    );

    /// @notice Emitted when a violation is recorded
    event ViolationRecorded(
        string indexed txId,
        bytes32 indexed reasonHash,
        string penaltyApplied,
        uint256 timestamp
    );

    /// @notice Emitted when a clawback is executed
    event ClawbackExecuted(
        string indexed originalTxId,
        string indexed clawbackTxId,
        bytes32 reasonHash,
        uint256 timestamp
    );

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @dev Initializes the contract with system admin as owner
     * @param _backendServiceAccount Address of the backend service account
     */
    constructor(address _backendServiceAccount) Ownable(msg.sender) {
        require(
            _backendServiceAccount != address(0),
            "Invalid backend service account"
        );
        backendServiceAccount = _backendServiceAccount;
    }

    // ============================================
    // MODIFIERS
    // ============================================

    /// @notice Restricts function access to backend service account only
    modifier onlyBackendService() {
        require(
            msg.sender == backendServiceAccount,
            "Unauthorized: Only backend service can call this function"
        );
        _;
    }

    // ============================================
    // ADMINISTRATIVE FUNCTIONS
    // ============================================

    /**
     * @notice Updates the backend service account address
     * @dev Only owner (System Admin) can update
     * @param _newBackendAccount New backend service account address
     */
    function updateBackendServiceAccount(
        address _newBackendAccount
    ) external onlyOwner {
        require(_newBackendAccount != address(0), "Invalid address");
        address oldAccount = backendServiceAccount;
        backendServiceAccount = _newBackendAccount;

        emit BackendServiceAccountUpdated(oldAccount, _newBackendAccount);
    }

    // ============================================
    // POLICY REGISTRATION FUNCTIONS
    // ============================================

    /**
     * @notice Registers a new programmable money policy
     * @dev Only backend service can register policies
     * @param _walletId Unique wallet identifier
     * @param _policyHash Keccak256 hash of the policy JSON
     */
    function registerPolicy(
        string memory _walletId,
        bytes32 _policyHash
    ) external onlyBackendService {
        require(bytes(_walletId).length > 0, "Wallet ID cannot be empty");
        require(_policyHash != bytes32(0), "Policy hash cannot be zero");

        bytes32 walletIdHash = keccak256(abi.encodePacked(_walletId));

        // Check if policy already exists for this wallet
        require(
            policies[walletIdHash].timestamp == 0,
            "Policy already registered for this wallet"
        );

        // Register new policy
        policies[walletIdHash] = Policy({
            walletId: _walletId,
            policyHash: _policyHash,
            timestamp: block.timestamp,
            deployedBy: msg.sender,
            isActive: true
        });

        totalPolicies++;

        emit PolicyRegistered(
            _walletId,
            _policyHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @notice Retrieves policy details for a wallet
     * @param _walletId Wallet identifier
     * @return Policy struct containing policy metadata
     */
    function getPolicy(
        string memory _walletId
    ) external view returns (Policy memory) {
        bytes32 walletIdHash = keccak256(abi.encodePacked(_walletId));
        require(
            policies[walletIdHash].timestamp != 0,
            "Policy not found for this wallet"
        );
        return policies[walletIdHash];
    }

    /**
     * @notice Checks if a policy exists and is active
     * @param _walletId Wallet identifier
     * @return bool True if policy exists and is active
     */
    function isPolicyActive(
        string memory _walletId
    ) external view returns (bool) {
        bytes32 walletIdHash = keccak256(abi.encodePacked(_walletId));
        return policies[walletIdHash].isActive;
    }

    // ============================================
    // TRANSACTION LOGGING FUNCTIONS
    // ============================================

    /**
     * @notice Logs a transaction validation decision
     * @dev Only backend service can log transactions
     * @param _walletId Wallet initiating the transaction
     * @param _txId Unique transaction identifier
     * @param _decision Validation outcome (APPROVED, BLOCKED, VIOLATION)
     * @param _policyHash Hash of the policy used for validation
     */
    function logTransaction(
        string memory _walletId,
        string memory _txId,
        Decision _decision,
        bytes32 _policyHash
    ) external onlyBackendService {
        require(bytes(_walletId).length > 0, "Wallet ID cannot be empty");
        require(bytes(_txId).length > 0, "Transaction ID cannot be empty");
        require(_policyHash != bytes32(0), "Policy hash cannot be zero");

        bytes32 txIdHash = keccak256(abi.encodePacked(_txId));

        // Prevent duplicate logging
        require(
            transactionLogs[txIdHash].timestamp == 0,
            "Transaction already logged"
        );

        // Log transaction
        transactionLogs[txIdHash] = TransactionLog({
            walletId: _walletId,
            txId: _txId,
            decision: _decision,
            policyHash: _policyHash,
            timestamp: block.timestamp,
            loggedBy: msg.sender
        });

        totalTransactionsLogged++;

        emit TransactionLogged(
            _walletId,
            _txId,
            _decision,
            _policyHash,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves transaction log details
     * @param _txId Transaction identifier
     * @return TransactionLog struct containing log metadata
     */
    function getTransactionLog(
        string memory _txId
    ) external view returns (TransactionLog memory) {
        bytes32 txIdHash = keccak256(abi.encodePacked(_txId));
        require(
            transactionLogs[txIdHash].timestamp != 0,
            "Transaction log not found"
        );
        return transactionLogs[txIdHash];
    }

    // ============================================
    // VIOLATION RECORDING FUNCTIONS
    // ============================================

    /**
     * @notice Records a compliance violation
     * @dev Only backend service can record violations
     * @param _txId Transaction ID that violated policy
     * @param _reasonHash Hash of violation reason/details
     * @param _penaltyApplied Description of penalty applied
     */
    function recordViolation(
        string memory _txId,
        bytes32 _reasonHash,
        string memory _penaltyApplied
    ) external onlyBackendService {
        require(bytes(_txId).length > 0, "Transaction ID cannot be empty");
        require(_reasonHash != bytes32(0), "Reason hash cannot be zero");

        bytes32 txIdHash = keccak256(abi.encodePacked(_txId));

        // Prevent duplicate violation recording
        require(
            violationRecords[txIdHash].timestamp == 0,
            "Violation already recorded for this transaction"
        );

        // Record violation
        violationRecords[txIdHash] = ViolationRecord({
            txId: _txId,
            reasonHash: _reasonHash,
            penaltyApplied: _penaltyApplied,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        });

        totalViolations++;

        emit ViolationRecorded(
            _txId,
            _reasonHash,
            _penaltyApplied,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves violation record details
     * @param _txId Transaction identifier
     * @return ViolationRecord struct containing violation metadata
     */
    function getViolationRecord(
        string memory _txId
    ) external view returns (ViolationRecord memory) {
        bytes32 txIdHash = keccak256(abi.encodePacked(_txId));
        require(
            violationRecords[txIdHash].timestamp != 0,
            "Violation record not found"
        );
        return violationRecords[txIdHash];
    }

    // ============================================
    // CLAWBACK LOGGING FUNCTIONS
    // ============================================

    /**
     * @notice Logs a clawback (transaction reversal) execution
     * @dev Only backend service can log clawbacks
     * @param _originalTxId Original transaction being reversed
     * @param _clawbackTxId Clawback transaction identifier
     * @param _reasonHash Hash of clawback reason
     */
    function logClawback(
        string memory _originalTxId,
        string memory _clawbackTxId,
        bytes32 _reasonHash
    ) external onlyBackendService {
        require(
            bytes(_originalTxId).length > 0,
            "Original transaction ID cannot be empty"
        );
        require(
            bytes(_clawbackTxId).length > 0,
            "Clawback transaction ID cannot be empty"
        );
        require(_reasonHash != bytes32(0), "Reason hash cannot be zero");

        bytes32 clawbackTxIdHash = keccak256(abi.encodePacked(_clawbackTxId));

        // Prevent duplicate clawback logging
        require(
            clawbackRecords[clawbackTxIdHash].timestamp == 0,
            "Clawback already logged"
        );

        // Log clawback
        clawbackRecords[clawbackTxIdHash] = ClawbackRecord({
            originalTxId: _originalTxId,
            clawbackTxId: _clawbackTxId,
            reasonHash: _reasonHash,
            timestamp: block.timestamp,
            executedBy: msg.sender
        });

        totalClawbacks++;

        emit ClawbackExecuted(
            _originalTxId,
            _clawbackTxId,
            _reasonHash,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves clawback record details
     * @param _clawbackTxId Clawback transaction identifier
     * @return ClawbackRecord struct containing clawback metadata
     */
    function getClawbackRecord(
        string memory _clawbackTxId
    ) external view returns (ClawbackRecord memory) {
        bytes32 clawbackTxIdHash = keccak256(abi.encodePacked(_clawbackTxId));
        require(
            clawbackRecords[clawbackTxIdHash].timestamp != 0,
            "Clawback record not found"
        );
        return clawbackRecords[clawbackTxIdHash];
    }
}
