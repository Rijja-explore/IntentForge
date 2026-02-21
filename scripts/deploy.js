const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying IntentForge Audit Contract...\n");

  // Get signers
  const [systemAdmin, backendService, auditor, walletA, walletB] = await hre.ethers.getSigners();

  console.log("📋 Account Configuration:");
  console.log("├─ System Admin (Owner):", systemAdmin.address);
  console.log("├─ Backend Service:", backendService.address);
  console.log("├─ Compliance Auditor:", auditor.address);
  console.log("├─ Mock Wallet A:", walletA.address);
  console.log("└─ Mock Wallet B:", walletB.address);
  console.log();

  // Deploy contract
  const IntentForgeAudit = await hre.ethers.getContractFactory("IntentForgeAudit");
  const intentForgeAudit = await IntentForgeAudit.deploy(backendService.address);

  await intentForgeAudit.waitForDeployment();
  const contractAddress = await intentForgeAudit.getAddress();

  console.log("✅ IntentForgeAudit deployed to:", contractAddress);
  console.log("✅ Contract Owner:", await intentForgeAudit.owner());
  console.log("✅ Backend Service Account:", await intentForgeAudit.backendServiceAccount());
  console.log("✅ Contract Version:", await intentForgeAudit.VERSION());
  console.log();

  console.log("📊 Initial State:");
  console.log("├─ Total Policies:", await intentForgeAudit.totalPolicies());
  console.log("├─ Total Transactions:", await intentForgeAudit.totalTransactionsLogged());
  console.log("├─ Total Violations:", await intentForgeAudit.totalViolations());
  console.log("└─ Total Clawbacks:", await intentForgeAudit.totalClawbacks());
  console.log();

  console.log("🎯 Deployment Summary:");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployment successful! 🎉");

  return {
    contract: intentForgeAudit,
    contractAddress: contractAddress,
    accounts: {
      systemAdmin: systemAdmin.address,
      backendService: backendService.address,
      auditor: auditor.address,
      walletA: walletA.address,
      walletB: walletB.address
    }
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
