#!/usr/bin/env node
import readline from "readline";
import { setupWebpack } from "./setupWebpack.js";
import { setupLibrary } from "./setupLibrary.js";

const colors = {
  // Primary action color - for interactive elements
  primary: "\x1b[34m", // Blue
  // Accent color - for selected items
  accent: "\x1b[32m", // Green
  // Info color - for messages and headers
  info: "\x1b[36m", // Cyan
  // Text color - for regular content
  text: "\x1b[37m", // White
  // Emphasis - for important elements
  emphasis: "\x1b[1m", // Bold
  reset: "\x1b[0m", // Reset all colors
};

function createInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  return rl;
}

function prompt(message, choices) {
  return new Promise((resolve) => {
    let selectedIndex = 0;

    // Helper to render choices
    const render = () => {
      console.clear();
      // Header with info color and emphasis
      console.log(
        `\n${colors.info}${colors.emphasis}🚀 ${message}${colors.reset}\n`
      );

      choices.forEach((choice, i) => {
        const isSelected = i === selectedIndex;
        // Selected item gets accent color and arrow
        const prefix = isSelected
          ? `${colors.accent}${colors.emphasis}❯${colors.reset} `
          : "  ";
        // Selected text gets primary color, unselected gets normal text color
        const text = isSelected
          ? `${colors.primary}${colors.emphasis}${choice.name}${colors.reset}`
          : `${colors.text}${choice.name}${colors.reset}`;
        console.log(`${prefix}${text}`);
      });
    };

    render();

    // Handle keypress
    process.stdin.on("keypress", (str, key) => {
      if (key.name === "up" && selectedIndex > 0) {
        selectedIndex--;
        render();
      } else if (key.name === "down" && selectedIndex < choices.length - 1) {
        selectedIndex++;
        render();
      } else if (key.name === "return") {
        process.stdin.removeAllListeners("keypress");
        process.stdin.setRawMode(false);
        console.clear();
        resolve(choices[selectedIndex].value);
      } else if (key.ctrl && key.name === "c") {
        process.exit();
      }
    });
  });
}

async function run() {
  const rl = createInterface();

  console.log("🚀 React Native Web Toolkit");
  try {
    const choices = [
      { name: "Setup Webpack in existing project", value: "webpack" },
      { name: "Setup using bundled library", value: "library" },
    ];

    const choice = await prompt("Choose setup option:", choices);

    if (choice === "webpack") {
      await setupWebpack();
    } else {
      await setupLibrary();
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    rl.close();
    process.stdin.setRawMode(false);
    process.exit();
  }
}

run();
