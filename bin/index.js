#!/usr/bin/env node

import inquirer from "inquirer";
import { setupWebpack } from "./setupWebpack.js";
import { setupLibrary } from "./setupLibrary.js";

async function run() {
  console.log("🚀 React Native Web Toolkit");

  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "Choose setup option:",
      choices: [
        { name: "Setup Webpack in existing project", value: "webpack" },
        { name: "Setup using bundled library", value: "library" },
      ],
    },
  ]);

  if (choice === "webpack") {
    await setupWebpack();
  } else {
    await setupLibrary();
  }
}

run();
