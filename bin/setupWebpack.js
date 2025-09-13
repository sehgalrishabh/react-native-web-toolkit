import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function checkReactNativeVersion() {
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

function addScripts(projectDir) {
  const pkgPath = path.join(projectDir, "package.json");
  let pkg = {};

  // Read or create package.json
  if (fs.existsSync(pkgPath)) {
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    } catch (err) {
      console.error("Failed to parse package.json:", err);
      process.exit(1);
    }
  } else {
    console.log("No package.json found — creating a minimal one.");
    pkg = {
      name: path.basename(projectDir),
      version: "1.0.0",
      scripts: {},
    };
  }

  pkg.scripts = pkg.scripts || {};

  // Scripts we want to add
  const webScript =
    "webpack serve --config webpack.config.js --mode development";
  const webBuildScript = "webpack --config webpack.config.js --mode production";

  if (pkg.scripts.web) {
    console.log(
      `package.json already contains a "web" script: "${pkg.scripts.web}" — leaving it unchanged.`
    );
  } else {
    pkg.scripts.web = webScript;
    // add web:build only if not present
    if (!pkg.scripts["web:build"]) {
      pkg.scripts["web:build"] = webBuildScript;
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
    console.log('✅ Added "web" and "web:build" scripts to package.json.');
  }
}

function installLibraries(projectDir) {
  // Dev dependencies to install
  const devDeps = [
    "webpack",
    "webpack-cli",
    "webpack-dev-server",
    "babel-loader",
    "@babel/core",
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript",
    "html-webpack-plugin",
  ];

  const deps = ["react-native-web", "react-dom"];

  try {
    console.log("\n📦 Installing devDependencies into the current project");
    execSync(`npm install --save-dev ${devDeps.join(" ")} --legacy-peer-deps`, {
      stdio: "inherit",
      cwd: projectDir,
    });
  } catch (err) {
    console.error("Failed to install devDependencies:", err);
    process.exit(1);
  }

  try {
    console.log("\n📦 Installing dependencies into the current project");
    execSync(`npm install ${deps.join(" ")} --legacy-peer-deps`, {
      stdio: "inherit",
      cwd: projectDir,
    });
  } catch (err) {
    console.error("Failed to install dependencies:", err);
    process.exit(1);
  }
}

function createWebpack() {
  // create webpack config
  fs.writeFileSync(
    "webpack.config.js",
    `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const appDirectory = path.resolve(__dirname);
const babelConfig = require(\`\${appDirectory}/babel.config\`);

const BabelLoader = {
  test: /\.(js|jsx|ts|tsx)$/,
  exclude: {
    and: [
      // babel will exclude these from transpling
      path.resolve(appDirectory, 'node_modules'),
      path.resolve(appDirectory, 'ios'),
      path.resolve(appDirectory, 'android'),
    ],
    // whitelisted modules to be transpiled by babel
    not: [],
  },
  include: [
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'App.tsx'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      presets: babelConfig.presets,
      plugins: babelConfig.plugins,
    },
  },
};

const AssetsLoader = { test: /.(png|jpe?g|gif|svg)$/, type: 'asset/resource' };

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(appDirectory, './public/index.html'),
});

module.exports = {
  entry: path.resolve(__dirname, 'index.web.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[id].bundle.js',
    asyncChunks: true,
  },
  resolve: {
    extensions: [
      '.web.ts',
      '.web.tsx',
      '.web.js',
      '.web.jsx',
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
    ],
    alias: { 'react-native$': 'react-native-web' },
  },
  module: { rules: [BabelLoader, AssetsLoader] },
  plugins: [HtmlWebpackPluginConfig],
};
`
  );
}

function createBabelConfig(projectDir) {
  const babelConfigPath = path.join(projectDir, "babel.config.js");

  const requiredOverride = `
  {
    include: /node_modules/,
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
    ],
  }`;

  if (!fs.existsSync(babelConfigPath)) {
    const babelConfig = `module.exports = {
    overrides: [
      ${requiredOverride}
    ],
  };`;

    fs.writeFileSync(babelConfigPath, babelConfig, "utf8");
    console.log("✅ Created babel.config.js");
  } else {
    // Patch existing config
    let content = fs.readFileSync(babelConfigPath, "utf8");

    if (!content.includes("@babel/preset-env")) {
      // Try to inject or append overrides
      if (content.includes("overrides: [")) {
        // Append our overrides inside existing overrides array
        content = content.replace(
          /overrides:\s*\[/,
          `overrides: [\n    ${requiredOverride},`
        );
      } else {
        // No overrides array → wrap existing config into one
        content = content.replace(
          /module\.exports\s*=\s*{([\s\S]*)};/,
          `module.exports = {
  overrides: [
    ${requiredOverride}
  ],
  $1
};`
        );
      }

      fs.writeFileSync(babelConfigPath, content, "utf8");
      console.log("⚡ Patched existing babel.config.js with Webpack overrides");
    } else {
      console.log(
        "✅ babel.config.js already has required Webpack parts — no changes made."
      );
    }
  }
}

function createIndexWeb(projectDir) {
  const indexWebPath = path.join(projectDir, "index.web.js");
  if (!fs.existsSync(indexWebPath)) {
    const indexWeb = `import { AppRegistry } from "react-native";
  import App from "./App";
  import { name as appName } from "./app.json";
  
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById("root"),
  });`;
    fs.writeFileSync(indexWebPath, indexWeb, "utf8");
    console.log("✅ Created index.web.js");
  } else {
    console.log("index.web.js already exists — skipped creation.");
  }
}

function createPublicHtml(projectDir) {
  const publicDir = path.join(projectDir, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const htmlPath = path.join(publicDir, "index.html");
  if (!fs.existsSync(htmlPath)) {
    const htmlContent = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>React Native Web</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body>
      <div id="root"></div>
      <noscript>You need to enable JavaScript to run this app.</noscript>
    </body>
  </html>`;
    fs.writeFileSync(htmlPath, htmlContent, "utf8");
    console.log("✅ Created public/index.html");
  } else {
    console.log("public/index.html already exists — skipped creation.");
  }
}

export async function setupWebpack() {
  const projectDir = process.cwd();
  console.log(`\n⚡ Setting up Webpack in: ${projectDir}\n`);

  checkReactNativeVersion();

  addScripts(projectDir);

  installLibraries(projectDir);

  createWebpack();

  createBabelConfig(projectDir);

  createIndexWeb(projectDir);

  createPublicHtml(projectDir);

  console.log("\n✅ Webpack setup complete.\n");
  console.log("Available commands:");
  console.log("- `npm run web`: Start the dev server");
  console.log("- `npm run web:build`: Build for production");
}
