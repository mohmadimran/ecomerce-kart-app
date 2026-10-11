const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const backendDirectory = path.resolve(__dirname, "..");
const roots = ["index.js", "jest.config.js", "src", "tests"];
const files = [];

const collectJavaScriptFiles = (target) => {
  const absolutePath = path.join(backendDirectory, target);
  const stat = fs.statSync(absolutePath);

  if (stat.isFile()) {
    if (absolutePath.endsWith(".js")) files.push(absolutePath);
    return;
  }

  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const childPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      collectJavaScriptFiles(path.relative(backendDirectory, childPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(childPath);
    }
  }
};

for (const root of roots) collectJavaScriptFiles(root);

for (const file of files) {
  new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
