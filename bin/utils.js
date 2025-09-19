import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function copyTemplate(fileName, targetDir) {
  const srcPath = path.resolve(__dirname, "../runtime", fileName);
  const destPath = path.resolve(targetDir, fileName);

  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Created ${fileName}`);
  } else {
    console.log(`${fileName} already exists — skipped`);
  }
}

export function checkReactNativeVersion() {
  const pkgPath = path.join(process.cwd(), "package.json");
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const rnVersion = pkg.dependencies["react-native"];
    if (!rnVersion) {
      console.error("❌ React Native not found in dependencies");
      process.exit(1);
    }

    const version = rnVersion.replace(/[^0-9.]/g, "");
    const major = parseInt(version.split(".")[0]);
    const minor = parseInt(version.split(".")[1]);

    if (major === 0 && minor < 81) {
      console.error("❌ This toolkit requires React Native 0.81.0 or higher");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Failed to check React Native version:", err);
    process.exit(1);
  }
}
