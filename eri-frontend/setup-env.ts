import * as fs from "fs";
import * as path from "path";

// Contract addresses from deployment
const CONTRACT_ADDRESSES = {
  NEXT_PUBLIC_AUTHENTICITY: "0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55",
  NEXT_PUBLIC_OWNERSHIP: "0x49e8207450dd0204Bb6a89A9edf7CE151cE58BBc",
  NEXT_PUBLIC_SIGNING_DOMAIN: "ERI",
  NEXT_PUBLIC_SIGNATURE_VERSION: "1",
};

// Create .env.local file content
const envContent = Object.entries(CONTRACT_ADDRESSES)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

const envPath = path.join(__dirname, ".env.local");

try {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ .env.local file created successfully!");
  console.log("📁 File location:", envPath);
  console.log("\n📋 Environment variables set:");
  Object.entries(CONTRACT_ADDRESSES).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
  });
  console.log("\n🚀 You can now run your Next.js application!");
} catch (error: any) {
  console.error("❌ Error creating .env.local file:", error.message);
  console.log(
    "\n📝 Please manually create a .env.local file in the eri-frontend directory with the following content:"
  );
  console.log("\n" + envContent);
}
