const { createCanvas, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// registerFont(path.join(__dirname, "ttf", "FiraSans-Bold.ttf"), {
//   family: "FiraSansBold",
// });
registerFont(
  path.join(__dirname, "ttf", "sofia-sans-semi-condensed-black.ttf"),
  {
    family: "SofiaSansSemiCondensedSemiBlack",
  },
);

const args = process.argv.slice(2);
const input = args[0] || "input.txt";
const output = args[1] || "output.png";
const width = args[2] || 1500;
const height = args[3] || 1500;

const text = cleanAndFormatText(fs.readFileSync(input, "utf-8"));
const canvasWidth = width * 1;
const canvasHeight = height * 1;
const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext("2d");
const lineHeight = 45; // Check: ctx.font
const lines = text.split("\n");
const letterSpacing = 2;
const totalTextHeight = lineHeight * lines.length;
const startY = (canvasHeight - totalTextHeight) / 2;

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.font = "40px SofiaSansSemiCondensedSemiBlack"; // Check: lineHeight
ctx.fillStyle = "white";
ctx.lineWidth = 2;
ctx.strokeStyle = "black";
ctx.textBaseline = "middle";
ctx.shadowColor = "rgba(0, 0, 0, 1)";
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

lines.forEach((line, index) => {
  const lineWidth = ctx.measureText(line).width + ctx.lineWidth;
  const startX = (canvasWidth - lineWidth - letterSpacing * line.length) / 2;
  const y = startY + index * lineHeight;
  let x = startX;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    ctx.strokeText(char, x, y);
    ctx.fillText(char, x, y);
    const charWidth = ctx.measureText(char).width;
    x += charWidth + letterSpacing;
  }
});

const out = fs.createWriteStream(output);
const stream = canvas.createPNGStream();
stream.pipe(out);

out.on("finish", async () => {
  // console.log("Finish");
});

function cleanAndFormatText(input, maxLength = 40) {
  let cleaned = input.replace(/ {2,}/g, "").replace(/\n/g, " ").trim();
  const words = cleaned.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if (currentLine.length + word.length + 1 <= maxLength) {
      currentLine += currentLine.length ? ` ${word}` : word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }

    const exceptions =
      /(?:Prof|Dr|Yard|Doc|Doç|Av|Mr|Mrs|Ms|Jr|Sr|Ph\.D|M\.D|Inc|Ltd|Co|St|vs|vb)\.$|^\d+\.$/;
    if (currentLine.includes(".") && !exceptions.test(currentLine.trim())) {
      lines.push(currentLine + "\n");
      currentLine = "";
    }
  });

  if (currentLine.length) {
    lines.push(currentLine);
  }

  return lines.join("\n");
}
