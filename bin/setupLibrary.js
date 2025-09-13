import { execSync } from "child_process";

export async function setupLibrary() {
  console.log("📦 Installing bundled library...");

  execSync("npm install react-native-web-bundled", {
    stdio: "inherit",
  });

  console.log("✅ Bundled library installed.");
}
