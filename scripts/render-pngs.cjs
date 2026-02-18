const fs = require("node:fs");
const path = require("node:path");

const { Resvg } = require("@resvg/resvg-js");

const renderSvgToPng = (inputPath, outputPath) => {
  const svg = fs.readFileSync(inputPath, "utf8");
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pngData.asPng());
};

const listSvgFiles = (rootDir) => {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        return;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        results.push(fullPath);
      }
    });
  };

  walk(rootDir);
  return results;
};

const roots = ["assets/brand", "assets/catalog", "assets/products"];
const svgFiles = roots.flatMap((root) => listSvgFiles(path.join(process.cwd(), root))).sort();

svgFiles.forEach((input) => {
  const output = input.replace(/\.svg$/i, ".png");
  renderSvgToPng(input, output);
  // eslint-disable-next-line no-console
  console.log(`Rendered ${path.relative(process.cwd(), output)}`);
});
