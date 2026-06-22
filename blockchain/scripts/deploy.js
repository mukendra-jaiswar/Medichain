const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MedicalRecords contract...");

  const MedicalRecords = await hre.ethers.getContractFactory("MedicalRecords");
  const contract = await MedicalRecords.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ MedicalRecords deployed to: ${address}`);

  // Write address to server .env
  const envPath = path.join(__dirname, "../../server/.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${address}`);
  fs.writeFileSync(envPath, envContent);
  console.log(`📝 Updated server/.env with CONTRACT_ADDRESS=${address}`);

  // Write ABI to server/services
  const artifact = await hre.artifacts.readArtifact("MedicalRecords");
  const abiPath = path.join(__dirname, "../../server/services/MedicalRecordsABI.json");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`📄 ABI saved to server/services/MedicalRecordsABI.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
