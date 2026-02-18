const fs = require("node:fs");
const path = require("node:path");

const readText = (filePath) => fs.readFileSync(filePath, "utf8");

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === ",") {
      values.push(current);
      current = "";
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
};

const parseCsv = (csvText) => {
  const lines = String(csvText || "")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
};

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const titleCase = (value) => {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
};

const slugFromId = (id) => String(id || "").trim().toLowerCase();

const stripProductSuffix = (title) => {
  const text = String(title || "").trim();
  const suffixes = [
    " Tee",
    " Hoodie",
    " Dad Hat",
    " Beanie",
    " Snapback",
    " Crewneck",
    " Long Sleeve",
  ];

  for (const suffix of suffixes) {
    if (text.endsWith(suffix)) return text.slice(0, -suffix.length);
  }

  return text;
};

const wrapText = (text, { maxChars, maxLines }) => {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) return [];

  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;
  return lines.slice(0, maxLines);
};

const makeShadowFilter = () => `
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000000" flood-opacity="0.22" />
  </filter>
`;

const makePrintShadowFilter = () => `
  <filter id="printShadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.22" />
  </filter>
`;

const makeBackground = () => `
  <radialGradient id="bg" cx="0.5" cy="0.38" r="0.9">
    <stop offset="0" stop-color="#f5f3ff" />
    <stop offset="0.55" stop-color="#ffffff" />
    <stop offset="1" stop-color="#ffffff" />
  </radialGradient>
`;

const makeFabricGradient = (shirtColor) => {
  if (shirtColor === "white") {
    return `
  <linearGradient id="fabric" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" />
    <stop offset="1" stop-color="#e5e7eb" />
  </linearGradient>
    `.trim();
  }

  return `
  <linearGradient id="fabric" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#111827" />
    <stop offset="1" stop-color="#0b0b0b" />
  </linearGradient>
  `.trim();
};

const renderTeeSilhouette = ({ shirtColor }) => {
  const outline =
    shirtColor === "white" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const highlight = shirtColor === "white" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)";
  const collar = shirtColor === "white" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)";

  return `
    <path
      d="M360 200 L285 250 Q265 265 275 290 L320 390 Q332 416 360 402 L430 360 L430 720 Q430 750 460 750 L740 750 Q770 750 770 720 L770 360 L840 402 Q868 416 880 390 L925 290 Q935 265 915 250 L840 200 Q790 165 730 175 Q712 220 600 220 Q488 220 470 175 Q410 165 360 200 Z"
      fill="url(#fabric)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M420 250 Q520 340 600 340 Q680 340 780 250"
      fill="none"
      stroke="${highlight}"
      stroke-width="26"
      stroke-linecap="round"
      opacity="0.18"
    />
    <path
      d="M470 196 Q600 268 730 196"
      fill="none"
      stroke="${collar}"
      stroke-width="16"
      stroke-linecap="round"
      opacity="0.9"
    />
  `.trim();
};

const renderHoodieSilhouette = ({ shirtColor }) => {
  const outline =
    shirtColor === "white" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const highlight = shirtColor === "white" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)";
  const hoodStroke = shirtColor === "white" ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.16)";

  return `
    <path
      d="M350 235 L280 285 Q262 300 272 322 L312 410 Q326 440 356 426 L430 392 L430 726 Q430 758 462 758 L738 758 Q770 758 770 726 L770 392 L844 426 Q874 440 888 410 L928 322 Q938 300 920 285 L850 235 Q806 205 748 206 Q724 306 600 306 Q476 306 452 206 Q394 205 350 235 Z"
      fill="url(#fabric)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M470 210 Q600 100 730 210 Q744 232 748 258 Q720 330 600 330 Q480 330 452 258 Q456 232 470 210 Z"
      fill="rgba(0,0,0,0.16)"
      stroke="${hoodStroke}"
      stroke-width="3"
      opacity="0.9"
    />
    <path
      d="M470 244 Q600 164 730 244"
      fill="none"
      stroke="${highlight}"
      stroke-width="20"
      stroke-linecap="round"
      opacity="0.18"
    />
    <rect x="470" y="592" width="260" height="112" rx="56" fill="rgba(0,0,0,0.16)" opacity="0.55" />
  `.trim();
};

const renderCrewneckSilhouette = ({ shirtColor }) => {
  const outline =
    shirtColor === "white" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const highlight =
    shirtColor === "white" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)";
  const collar =
    shirtColor === "white" ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.18)";

  return `
    <path
      d="M350 235 L280 285 Q262 300 272 322 L312 410 Q326 440 356 426 L430 392 L430 726 Q430 758 462 758 L738 758 Q770 758 770 726 L770 392 L844 426 Q874 440 888 410 L928 322 Q938 300 920 285 L850 235 Q806 205 748 206 Q724 300 600 300 Q476 300 452 206 Q394 205 350 235 Z"
      fill="url(#fabric)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M420 258 Q520 344 600 344 Q680 344 780 258"
      fill="none"
      stroke="${highlight}"
      stroke-width="26"
      stroke-linecap="round"
      opacity="0.16"
    />
    <path
      d="M482 236 Q600 296 718 236"
      fill="none"
      stroke="${collar}"
      stroke-width="20"
      stroke-linecap="round"
      opacity="0.92"
    />
    <rect x="456" y="728" width="288" height="28" rx="14" fill="rgba(0,0,0,0.16)" opacity="0.46" />
  `.trim();
};

const renderLongSleeveSilhouette = ({ shirtColor }) => {
  const outline =
    shirtColor === "white" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const highlight =
    shirtColor === "white" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)";
  const collar =
    shirtColor === "white" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.18)";

  return `
    <path
      d="M360 200 L285 250 Q265 265 275 290 L310 520 Q320 560 350 548 L430 495 L430 720 Q430 750 460 750 L740 750 Q770 750 770 720 L770 495 L850 548 Q880 560 890 520 L925 290 Q935 265 915 250 L840 200 Q790 165 730 175 Q712 220 600 220 Q488 220 470 175 Q410 165 360 200 Z"
      fill="url(#fabric)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M420 250 Q520 340 600 340 Q680 340 780 250"
      fill="none"
      stroke="${highlight}"
      stroke-width="26"
      stroke-linecap="round"
      opacity="0.18"
    />
    <path
      d="M470 196 Q600 268 730 196"
      fill="none"
      stroke="${collar}"
      stroke-width="16"
      stroke-linecap="round"
      opacity="0.9"
    />
    <path
      d="M315 522 Q328 552 350 548"
      fill="none"
      stroke="${highlight}"
      stroke-width="10"
      stroke-linecap="round"
      opacity="0.22"
    />
    <path
      d="M885 522 Q872 552 850 548"
      fill="none"
      stroke="${highlight}"
      stroke-width="10"
      stroke-linecap="round"
      opacity="0.22"
    />
  `.trim();
};

const renderHatSilhouette = ({ shirtColor }) => {
  const outline =
    shirtColor === "white" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.12)";
  const highlight = shirtColor === "white" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)";

  return `
    <path
      d="M360 430 Q380 300 500 266 Q600 236 700 266 Q820 300 840 430 Q845 460 822 472 Q740 514 600 514 Q460 514 378 472 Q355 460 360 430 Z"
      fill="url(#fabric)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
    />
    <path
      d="M320 510 Q420 560 600 560 Q780 560 880 510 Q915 492 920 518 Q926 552 896 570 Q778 644 600 644 Q422 644 304 570 Q274 552 280 518 Q285 492 320 510 Z"
      fill="rgba(0,0,0,0.22)"
      stroke="${outline}"
      stroke-width="3"
      stroke-linejoin="round"
      opacity="0.9"
    />
    <path
      d="M430 420 Q520 340 600 340 Q680 340 770 420"
      fill="none"
      stroke="${highlight}"
      stroke-width="24"
      stroke-linecap="round"
      opacity="0.16"
    />
  `.trim();
};

const renderRescueCross = ({ x, y, size, color, shirtColor }) => {
  const arm = size * 0.28;
  const length = size;
  const radius = arm * 0.45;
  const cutFill = shirtColor === "white" ? "#ffffff" : "#0b0b0b";

  return `
    <g transform="translate(${x} ${y})">
      <rect x="${-arm / 2}" y="${-length / 2}" width="${arm}" height="${length}" rx="${radius}" fill="${color}" />
      <rect x="${-length / 2}" y="${-arm / 2}" width="${length}" height="${arm}" rx="${radius}" fill="${color}" />
      <circle cx="0" cy="0" r="${arm * 0.62}" fill="${cutFill}" />
      <circle cx="0" cy="0" r="${arm * 0.62}" fill="none" stroke="${color}" stroke-width="${Math.max(3, arm * 0.12)}" opacity="0.9" />
      <text
        x="0"
        y="${arm * 0.26}"
        text-anchor="middle"
        font-family="Teko, Impact, Arial Black, sans-serif"
        font-size="${Math.round(arm * 0.9)}"
        font-weight="700"
        fill="${color}"
        letter-spacing="0.04em"
      >OH</text>
    </g>
	  `.trim();
};

const renderIconFrame = ({ size, shirtColor, accent }) => {
  const rx = size * 0.18;
  const fill = shirtColor === "white" ? "rgba(17,24,39,0.05)" : "rgba(0,0,0,0.28)";
  const stroke = accent || (shirtColor === "white" ? "rgba(17,24,39,0.18)" : "rgba(255,255,255,0.18)");
  const strokeWidth = Math.max(3, Math.round(size * 0.02));
  return `
    <rect
      x="${-size / 2}"
      y="${-size / 2}"
      width="${size}"
      height="${size}"
      rx="${rx}"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
      opacity="0.55"
    />
  `.trim();
};

const renderIcon = ({ kind, size, accent }) => {
  const stroke = accent || "#8b5cf6";
  const strokeWidth = Math.max(6, Math.round(size * 0.07));
  const half = size / 2;
  const softFill = `${stroke}33`;

  const octagon = (radius) => {
    const r = radius;
    const c = radius * 0.72;
    const points = [
      [0, -r],
      [c, -c],
      [r, 0],
      [c, c],
      [0, r],
      [-c, c],
      [-r, 0],
      [-c, -c],
    ]
      .map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(" ");
    return `<polygon points="${points}" />`;
  };

  const icon = (() => {
    switch (kind) {
      case "mic": {
        const headW = size * 0.34;
        const headH = size * 0.44;
        const bodyH = size * 0.22;
        return `
          <rect
            x="${-headW / 2}"
            y="${-half * 0.78}"
            width="${headW}"
            height="${headH}"
            rx="${headW / 2}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <rect
            x="${-headW / 2}"
            y="${-half * 0.28}"
            width="${headW}"
            height="${bodyH}"
            rx="${headW * 0.35}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M0 ${half * 0.05} V ${half * 0.62}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
          <path
            d="M${-half * 0.24} ${half * 0.62} H ${half * 0.24}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "micWhip": {
        const headW = size * 0.34;
        const headH = size * 0.44;
        const bodyH = size * 0.22;
        return `
          <rect
            x="${-headW / 2}"
            y="${-half * 0.78}"
            width="${headW}"
            height="${headH}"
            rx="${headW / 2}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <rect
            x="${-headW / 2}"
            y="${-half * 0.28}"
            width="${headW}"
            height="${bodyH}"
            rx="${headW * 0.35}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M0 ${half * 0.05} V ${half * 0.46}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
          <path
            d="M0 ${half * 0.46} C ${half * 0.12} ${half * 0.58}, ${half * 0.34} ${half * 0.46}, ${half * 0.28} ${half * 0.28}
               S ${half * 0.02} ${half * 0.05}, ${half * 0.22} ${-half * 0.04}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            stroke-linecap="round"
          />
          <circle cx="${half * 0.22}" cy="${-half * 0.04}" r="${Math.max(3, strokeWidth * 0.25)}" fill="${stroke}" opacity="0.9" />
        `.trim();
      }
      case "checkStamp": {
        const w = size * 0.78;
        const h = size * 0.62;
        const r = size * 0.12;
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2}"
            width="${w}"
            height="${h}"
            rx="${r}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${strokeWidth * 1.2} ${strokeWidth * 0.9}"
            opacity="0.9"
          />
          <path
            d="M${-size * 0.22} ${size * 0.02} L ${-size * 0.06} ${size * 0.18} L ${size * 0.26} ${-size * 0.16}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        `.trim();
      }
      case "coin": {
        const outerR = size * 0.42;
        const innerR = size * 0.28;
        return `
          <circle
            cx="0"
            cy="0"
            r="${outerR}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <circle
            cx="0"
            cy="0"
            r="${innerR}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            opacity="0.88"
          />
          <text
            x="0"
            y="${Math.round(size * 0.18)}"
            text-anchor="middle"
            font-family="Teko, Impact, Arial Black, sans-serif"
            font-size="${Math.round(size * 0.52)}"
            font-weight="800"
            fill="${stroke}"
            opacity="0.92"
          >$</text>
        `.trim();
      }
      case "clipboard": {
        const w = size * 0.66;
        const h = size * 0.84;
        const r = size * 0.12;
        const clipW = size * 0.28;
        const clipH = size * 0.18;
        const clipR = clipH * 0.55;
        const lineStroke = Math.max(4, Math.round(strokeWidth * 0.6));
        const left = -w / 2;
        const top = -h / 2;

        return `
          <rect
            x="${left}"
            y="${top}"
            width="${w}"
            height="${h}"
            rx="${r}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <rect
            x="${-clipW / 2}"
            y="${top - clipH * 0.15}"
            width="${clipW}"
            height="${clipH}"
            rx="${clipR}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            opacity="0.92"
          />
          <path
            d="M${left + w * 0.16} ${top + h * 0.34} H ${left + w * 0.84}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${left + w * 0.16} ${top + h * 0.52} H ${left + w * 0.78}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${left + w * 0.16} ${top + h * 0.7} H ${left + w * 0.72}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
        `.trim();
      }
      case "gearBurst": {
        const rOuter = size * 0.44;
        const ringR = size * 0.24;
        const holeR = size * 0.09;
        const outer = octagon(rOuter).replace(
          "/>",
          ` fill="${softFill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />`
        );

        return `
          ${outer}
          <circle
            cx="0"
            cy="0"
            r="${ringR}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            opacity="0.9"
          />
          <circle cx="0" cy="0" r="${holeR}" fill="${stroke}" opacity="0.85" />
          <path
            d="M${-size * 0.22} ${-size * 0.06} L ${-size * 0.02} ${size * 0.08} L ${-size * 0.06} ${size * 0.22}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.65))}"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.9"
          />
          <path
            d="M${size * 0.18} ${-size * 0.32} L ${size * 0.28} ${-size * 0.2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${size * 0.3} ${-size * 0.34} L ${size * 0.34} ${-size * 0.24}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.55))}"
            stroke-linecap="round"
            opacity="0.75"
          />
        `.trim();
      }
      case "rulebook": {
        const w = size * 0.82;
        const h = size * 0.62;
        const r = size * 0.12;
        const lineStroke = Math.max(4, Math.round(strokeWidth * 0.6));
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2}"
            width="${w}"
            height="${h}"
            rx="${r}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M0 ${-h / 2} V ${h / 2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.65))}"
            opacity="0.85"
          />
          <path
            d="M${-w * 0.34} ${-h * 0.18} H ${-w * 0.06}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${-w * 0.34} ${0} H ${-w * 0.12}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${w * 0.06} ${-h * 0.18} H ${w * 0.34}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            d="M${w * 0.12} ${0} H ${w * 0.34}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${lineStroke}"
            stroke-linecap="round"
            opacity="0.85"
          />
        `.trim();
      }
      case "scale": {
        return `
          <path
            d="M0 ${-half * 0.62} V ${half * 0.52}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
          <path
            d="M${-half * 0.46} ${-half * 0.32} H ${half * 0.46}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
          <path
            d="M${-half * 0.32} ${-half * 0.32} L ${-half * 0.44} ${half * 0.1}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            stroke-linecap="round"
          />
          <path
            d="M${half * 0.32} ${-half * 0.32} L ${half * 0.44} ${half * 0.1}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            stroke-linecap="round"
          />
          <path
            d="M${-half * 0.56} ${half * 0.12} Q ${-half * 0.44} ${half * 0.32} ${-half * 0.32} ${half * 0.12}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            stroke-linecap="round"
          />
          <path
            d="M${half * 0.32} ${half * 0.12} Q ${half * 0.44} ${half * 0.32} ${half * 0.56} ${half * 0.12}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            stroke-linecap="round"
          />
          <path
            d="M${-half * 0.18} ${half * 0.52} H ${half * 0.18}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "bingo": {
        const w = size * 0.78;
        const r = size * 0.12;
        const cell = w / 3;
        const start = -w / 2;
        const squares = [
          [0, 0],
          [1, 1],
          [2, 0],
        ];
        return `
          <rect
            x="${-w / 2}"
            y="${-w / 2}"
            width="${w}"
            height="${w}"
            rx="${r}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          ${[1, 2]
            .map(
              (n) => `
            <path
              d="M${start + cell * n} ${start} V ${start + w}"
              fill="none"
              stroke="${stroke}"
              stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
              opacity="0.85"
            />
            <path
              d="M${start} ${start + cell * n} H ${start + w}"
              fill="none"
              stroke="${stroke}"
              stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
              opacity="0.85"
            />
          `
            )
            .join("")}
          ${squares
            .map(([cx, cy]) => {
              const x = start + cx * cell + cell * 0.18;
              const y = start + cy * cell + cell * 0.18;
              const s = cell * 0.64;
              return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${cell * 0.14}" fill="${softFill}" />`;
            })
            .join("")}
        `.trim();
      }
      case "pillow": {
        const w = size * 0.86;
        const h = size * 0.58;
        const r = size * 0.22;
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2}"
            width="${w}"
            height="${h}"
            rx="${r}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M${-w * 0.28} ${-h * 0.18} Q 0 0 ${w * 0.28} ${-h * 0.18}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
            stroke-linecap="round"
          />
          <text
            x="${w * 0.22}"
            y="${h * 0.52}"
            text-anchor="middle"
            font-family="Teko, Impact, Arial Black, sans-serif"
            font-size="${Math.round(size * 0.22)}"
            font-weight="700"
            fill="${stroke}"
            opacity="0.9"
          >Zzz</text>
        `.trim();
      }
      case "stop": {
        const radius = size * 0.42;
        return `
          <g fill="${softFill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round">
            ${octagon(radius)}
          </g>
          <text
            x="0"
            y="${Math.round(size * 0.1)}"
            text-anchor="middle"
            font-family="Teko, Impact, Arial Black, sans-serif"
            font-size="${Math.round(size * 0.34)}"
            font-weight="800"
            fill="${stroke}"
            letter-spacing="0.06em"
          >NO</text>
        `.trim();
      }
      case "zzzMoon": {
        const moonR = size * 0.18;
        return `
          <path
            d="M${moonR} ${-moonR} A ${moonR} ${moonR} 0 1 0 ${moonR} ${moonR} A ${moonR * 0.72} ${moonR * 0.72} 0 1 1 ${moonR} ${-moonR} Z"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
            fill-rule="evenodd"
          />
          <text
            x="${-half * 0.12}"
            y="${half * 0.18}"
            text-anchor="middle"
            font-family="Teko, Impact, Arial Black, sans-serif"
            font-size="${Math.round(size * 0.32)}"
            font-weight="800"
            fill="${stroke}"
            opacity="0.92"
            letter-spacing="0.06em"
          >ZZZ</text>
        `.trim();
      }
      case "eye": {
        const w = size * 0.9;
        const h = size * 0.46;
        return `
          <path
            d="M${-w / 2} 0 Q 0 ${-h} ${w / 2} 0 Q 0 ${h} ${-w / 2} 0 Z"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
          />
          <circle cx="0" cy="0" r="${size * 0.14}" fill="${stroke}" opacity="0.9" />
          <circle cx="${-size * 0.05}" cy="${-size * 0.05}" r="${size * 0.05}" fill="#ffffff" opacity="0.65" />
        `.trim();
      }
      case "hourglass": {
        const w = size * 0.56;
        const h = size * 0.76;
        const yTop = -h / 2;
        const yBottom = h / 2;
        return `
          <path
            d="M${-w / 2} ${yTop} H ${w / 2} Q 0 ${-size * 0.12} ${-w / 2} 0 Q 0 ${size * 0.12} ${w / 2} ${yBottom} H ${-w / 2} Q 0 ${size * 0.12} ${w / 2} 0 Q 0 ${-size * 0.12} ${-w / 2} ${yTop} Z"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
          />
          <path
            d="M${-w * 0.22} ${yTop + size * 0.12} L ${w * 0.22} ${yTop + size * 0.12} L 0 ${-size * 0.04} Z"
            fill="${softFill}"
          />
          <path
            d="M${-w * 0.18} ${yBottom - size * 0.12} L ${w * 0.18} ${yBottom - size * 0.12} L 0 ${size * 0.12} Z"
            fill="${softFill}"
          />
        `.trim();
      }
      case "explosion": {
        const spikes = 10;
        const rOuter = size * 0.44;
        const rInner = size * 0.22;
        const points = Array.from({ length: spikes * 2 }, (_, i) => {
          const angle = (Math.PI * i) / spikes;
          const r = i % 2 === 0 ? rOuter : rInner;
          return `${(Math.cos(angle) * r).toFixed(2)} ${(Math.sin(angle) * r).toFixed(2)}`;
        }).join(" ");
        return `
          <polygon
            points="${points}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
          />
          <text
            x="0"
            y="${Math.round(size * 0.12)}"
            text-anchor="middle"
            font-family="Teko, Impact, Arial Black, sans-serif"
            font-size="${Math.round(size * 0.3)}"
            font-weight="800"
            fill="${stroke}"
            opacity="0.9"
          >!</text>
        `.trim();
      }
      case "hinge": {
        const w = size * 0.54;
        const h = size * 0.78;
        const r = size * 0.12;
        const dotR = Math.max(4, Math.round(size * 0.04));
        const dots = [-0.22, 0, 0.22].map(
          (offset) => `<circle cx="0" cy="${(offset * h).toFixed(2)}" r="${dotR}" fill="${stroke}" opacity="0.9" />`
        );
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2}"
            width="${w}"
            height="${h}"
            rx="${r}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M0 ${-h / 2} V ${h / 2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
          />
          ${dots.join("\n")}
        `.trim();
      }
      case "envelopeSlash": {
        const w = size * 0.84;
        const h = size * 0.54;
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2}"
            width="${w}"
            height="${h}"
            rx="${size * 0.12}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M${-w / 2} ${-h / 2} L 0 ${h * 0.08} L ${w / 2} ${-h / 2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
          />
          <path
            d="M${-w * 0.48} ${h * 0.42} L ${w * 0.48} ${-h * 0.42}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "winkFace": {
        const r = size * 0.4;
        const eyeY = -size * 0.12;
        const openEyeX = size * 0.14;
        const openEyeR = Math.max(5, Math.round(size * 0.055));
        const winkLeft = -size * 0.22;
        const winkRight = -size * 0.06;
        const winkCtrlY = eyeY + size * 0.08;
        const smileLeft = -size * 0.18;
        const smileRight = size * 0.22;
        const smileY = size * 0.12;
        const smileCtrlY = size * 0.28;

        return `
          <circle
            cx="0"
            cy="0"
            r="${r}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <circle
            cx="${openEyeX}"
            cy="${eyeY}"
            r="${openEyeR}"
            fill="${stroke}"
            opacity="0.9"
          />
          <path
            d="M${winkLeft} ${eyeY} Q ${-size * 0.14} ${winkCtrlY} ${winkRight} ${eyeY}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            stroke-linecap="round"
          />
          <path
            d="M${smileLeft} ${smileY} Q ${size * 0.02} ${smileCtrlY} ${smileRight} ${smileY}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(5, Math.round(strokeWidth * 0.8))}"
            stroke-linecap="round"
          />
          <path
            d="M${size * 0.18} ${smileY} Q ${size * 0.26} ${smileY + size * 0.08} ${size * 0.14} ${smileY + size * 0.16}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            stroke-linecap="round"
            opacity="0.85"
          />
        `.trim();
      }
      case "podium": {
        const w = size * 0.68;
        const h = size * 0.56;
        return `
          <rect
            x="${-w / 2}"
            y="${-h / 2 + size * 0.1}"
            width="${w}"
            height="${h}"
            rx="${size * 0.12}"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
          />
          <path
            d="M0 ${-half * 0.64} V ${-half * 0.22}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.7))}"
            stroke-linecap="round"
          />
          <circle cx="0" cy="${-half * 0.7}" r="${size * 0.09}" fill="${stroke}" opacity="0.9" />
          <path
            d="M${-w * 0.18} ${half * 0.38} H ${w * 0.18}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "heartMic": {
        const heart = `
          <path
            d="M0 ${half * 0.32}
               C ${half * 0.66} ${-half * 0.05}, ${half * 0.44} ${-half * 0.66}, 0 ${-half * 0.34}
               C ${-half * 0.44} ${-half * 0.66}, ${-half * 0.66} ${-half * 0.05}, 0 ${half * 0.32} Z"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.8))}"
            stroke-linejoin="round"
          />
        `;
        const micW = size * 0.22;
        const micH = size * 0.34;
        return `
          ${heart}
          <rect
            x="${-micW / 2}"
            y="${-micH / 2 - size * 0.06}"
            width="${micW}"
            height="${micH}"
            rx="${micW / 2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            opacity="0.9"
          />
          <path
            d="M0 ${size * 0.12} V ${size * 0.34}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            stroke-linecap="round"
            opacity="0.9"
          />
        `.trim();
      }
      case "headache": {
        return `
          <circle cx="${-size * 0.1}" cy="${size * 0.04}" r="${size * 0.26}" fill="${softFill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
          <path
            d="M${size * 0.12} ${-size * 0.34} L ${-size * 0.02} ${-size * 0.08} H ${size * 0.16} L ${size * 0.02} ${size * 0.2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <path
            d="M${-size * 0.38} ${-size * 0.18} Q ${-size * 0.2} ${-size * 0.32} ${-size * 0.02} ${-size * 0.18}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "docGlasses": {
        const w = size * 0.72;
        const h = size * 0.82;
        return `
          <path
            d="M${-w / 2} ${-h / 2} H ${w * 0.18} L ${w / 2} ${-h * 0.18} V ${h / 2} H ${-w / 2} Z"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
          />
          <path
            d="M${w * 0.18} ${-h / 2} V ${-h * 0.18} H ${w / 2}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
            opacity="0.9"
          />
          <circle cx="${-w * 0.18}" cy="${h * 0.1}" r="${size * 0.1}" fill="none" stroke="${stroke}" stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}" />
          <circle cx="${w * 0.08}" cy="${h * 0.1}" r="${size * 0.1}" fill="none" stroke="${stroke}" stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}" />
          <path
            d="M${-w * 0.08} ${h * 0.1} H ${-w * 0.02}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.55))}"
            opacity="0.9"
            stroke-linecap="round"
          />
        `.trim();
      }
      case "megaphonePencil": {
        const coneW = size * 0.62;
        const coneH = size * 0.34;
        return `
          <path
            d="M${-coneW / 2} ${-coneH / 2} L ${coneW / 2} 0 L ${-coneW / 2} ${coneH / 2} Z"
            fill="${softFill}"
            stroke="${stroke}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="round"
          />
          <rect
            x="${-coneW / 2 - size * 0.08}"
            y="${-coneH * 0.22}"
            width="${size * 0.16}"
            height="${coneH * 0.44}"
            rx="${size * 0.06}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.6))}"
          />
          <path
            d="M${-half * 0.08} ${half * 0.38} L ${half * 0.38} ${half * 0.02}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.75))}"
            stroke-linecap="round"
          />
          <path
            d="M${half * 0.28} ${half * 0.12} L ${half * 0.44} ${-half * 0.04}"
            fill="none"
            stroke="${stroke}"
            stroke-width="${Math.max(4, Math.round(strokeWidth * 0.55))}"
            opacity="0.9"
            stroke-linecap="round"
          />
        `.trim();
      }
      default:
        return `
          <circle cx="0" cy="0" r="${size * 0.36}" fill="${softFill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        `.trim();
    }
  })();

  return `
    <g
      fill="none"
      stroke="${stroke}"
      stroke-width="${strokeWidth}"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-label="${escapeXml(kind || "icon")}"
    >
      ${icon}
    </g>
  `.trim();
};

const renderTextBlock = ({ lines, x, y, fill, fontSize, lineHeight, weight }) => {
  const safeLines = lines.map(escapeXml);
  const totalHeight = (safeLines.length - 1) * lineHeight;
  const startY = y - totalHeight / 2;

  return `
    <text
      x="${x}"
      y="${startY}"
      text-anchor="middle"
      font-family="Teko, Impact, Arial Black, sans-serif"
      font-size="${fontSize}"
      font-weight="${weight}"
      fill="${fill}"
      letter-spacing="0.02em"
    >
      ${safeLines
        .map((line, index) => {
          const dy = index === 0 ? 0 : lineHeight;
          return `<tspan x="${x}" dy="${dy}">${line}</tspan>`;
        })
        .join("")}
    </text>
	  `.trim();
};

const posterLayoutForItemType = (itemType) => {
  if (itemType === "hat") return null;
  if (itemType === "hoodie" || itemType === "crewneck") {
    return {
      topY: 305,
      iconY: 455,
      bottomY: 612,
      frameSize: 250,
      iconSize: 170,
    };
  }

  return {
    topY: 300,
    iconY: 450,
    bottomY: 606,
    frameSize: 238,
    iconSize: 162,
  };
};

const posterFontSize = ({ itemType, lines }) => {
  const count = Array.isArray(lines) ? lines.length : 0;
  const base = itemType === "hoodie" || itemType === "crewneck" ? 92 : 96;
  if (count >= 3) return 62;
  if (count === 2) return 74;
  return base;
};

const renderPosterPrint = ({
  itemType,
  shirtColor,
  printColor,
  accent,
  iconKind,
  topLines,
  bottomLines,
}) => {
  const layout = posterLayoutForItemType(itemType);
  if (!layout) return "";

  const x = 600;
  const topFontSize = posterFontSize({ itemType, lines: topLines });
  const bottomFontSize = posterFontSize({ itemType, lines: bottomLines });

  const topMarkup = renderTextBlock({
    lines: topLines,
    x,
    y: layout.topY,
    fill: printColor,
    fontSize: topFontSize,
    lineHeight: Math.round(topFontSize * 0.88),
    weight: 800,
  });

  const bottomMarkup = renderTextBlock({
    lines: bottomLines,
    x,
    y: layout.bottomY,
    fill: printColor,
    fontSize: bottomFontSize,
    lineHeight: Math.round(bottomFontSize * 0.88),
    weight: 800,
  });

  const iconMarkup = `
    <g transform="translate(${x} ${layout.iconY})" filter="url(#printShadow)">
      ${renderIconFrame({ size: layout.frameSize, shirtColor, accent })}
      ${renderIcon({ kind: iconKind, size: layout.iconSize, accent })}
    </g>
  `.trim();

  return [topMarkup, iconMarkup, bottomMarkup].filter(Boolean).join("\n");
};

const buildMockupSvg = ({
  title,
  itemType,
  shirtColor,
  printColor,
  lines,
  emblem,
  design,
}) => {
  const defs = [
    makeBackground(),
    makeShadowFilter(),
    makePrintShadowFilter(),
    makeFabricGradient(shirtColor),
  ].join("\n");

  const silhouette =
    itemType === "hat"
      ? renderHatSilhouette({ shirtColor })
      : itemType === "hoodie"
        ? renderHoodieSilhouette({ shirtColor })
        : itemType === "crewneck"
          ? renderCrewneckSilhouette({ shirtColor })
          : itemType === "longsleeve"
            ? renderLongSleeveSilhouette({ shirtColor })
        : renderTeeSilhouette({ shirtColor });

  const printArea = (() => {
    if (itemType === "hat") return { x: 600, y: 410 };
    if (itemType === "hoodie" || itemType === "crewneck") return { x: 600, y: 474 };
    return { x: 600, y: 470 };
  })();

  const fontSize = (() => {
    if (itemType === "hat") {
      if (emblem || design?.icon) {
        if (lines.length >= 3) return 44;
        if (lines.length === 2) return 52;
        return 58;
      }
      return lines.length >= 3 ? 52 : 62;
    }
    if (lines.length >= 4) return 56;
    if (lines.length === 3) return 66;
    if (lines.length === 2) return 78;
    return 92;
  })();

  const lineHeight = Math.round(fontSize * 0.9);
  const hasEmblem = Boolean(emblem);
  const accent = design?.accent || "#8b5cf6";
  const iconKind = design?.icon;
  const usePoster = Boolean(design?.template === "poster" && iconKind && itemType !== "hat" && !hasEmblem);

  const emblemMarkup = hasEmblem
    ? renderRescueCross({
        x: 600,
        y: itemType === "hat" ? 350 : 330,
        size: itemType === "hat" ? 110 : 140,
        color: printColor,
        shirtColor,
      })
    : "";

  const iconLayout = (() => {
    if (itemType === "hat") {
      return { y: 340, frameSize: 118, iconSize: 74 };
    }

    if (hasEmblem) {
      return { y: 480, frameSize: 160, iconSize: 104 };
    }

    return { y: 336, frameSize: 210, iconSize: 140 };
  })();

  const stackIconMarkup =
    !usePoster && iconKind
      ? `
          <g transform="translate(600 ${iconLayout.y})" filter="url(#printShadow)">
            ${renderIconFrame({
              size: iconLayout.frameSize,
              shirtColor,
              accent,
            })}
            ${renderIcon({
              kind: iconKind,
              size: iconLayout.iconSize,
              accent,
            })}
          </g>
        `.trim()
      : "";

  const textY = (() => {
    const base = (() => {
      if (itemType === "hat") {
        return hasEmblem || iconKind ? printArea.y + 72 : printArea.y;
      }

      if (hasEmblem && iconKind) return printArea.y + 200;
      if (hasEmblem || iconKind) return printArea.y + 96;
      return printArea.y;
    })();

    if (itemType !== "hat") return base;
    const maxBottomBaseline = 495;
    const totalHeight = (lines.length - 1) * lineHeight;
    const maxCenter = maxBottomBaseline - totalHeight / 2;
    return Math.min(base, maxCenter);
  })();

  const textMarkup = usePoster
    ? renderPosterPrint({
        itemType,
        shirtColor,
        printColor,
        accent,
        iconKind,
        topLines: design?.topLines || [],
        bottomLines: design?.bottomLines || [],
      })
    : renderTextBlock({
        lines,
        x: printArea.x,
        y: textY,
        fill: printColor,
        fontSize,
        lineHeight,
        weight: 800,
      });

  const printMarkup = [stackIconMarkup, emblemMarkup, textMarkup].filter(Boolean).join("\n");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
${defs}
  </defs>

  <rect width="1200" height="800" fill="url(#bg)" />
  <ellipse cx="600" cy="716" rx="280" ry="64" fill="rgba(0,0,0,0.12)" />

  <g filter="url(#shadow)">
${silhouette}
    <g>
      ${printMarkup}
    </g>
  </g>
</svg>
  `.trim();
};

const csvPath = path.join(process.cwd(), "catalog", "offendhop-facebook-marketplace-catalog.csv");
const rows = parseCsv(readText(csvPath));

const outDir = path.join(process.cwd(), "assets", "products");
fs.mkdirSync(outDir, { recursive: true });

const isSpecial = (id) =>
  id === "OH-TEE-SPERMDONOR" || id === "OH-TEE-ORGASMDONOR";

const itemTypeFromId = (id) => {
  if (id.startsWith("OH-HAT-")) return "hat";
  if (id.startsWith("OH-HDY-")) return "hoodie";
  if (id.startsWith("OH-CRW-")) return "crewneck";
  if (id.startsWith("OH-LS-")) return "longsleeve";
  return "tee";
};

const buildDefaultLines = ({ id, title }) => {
  const base = stripProductSuffix(title);
  const itemType = itemTypeFromId(id);
  const wrap =
    itemType === "hat"
      ? { maxChars: 14, maxLines: 3 }
      : { maxChars: 18, maxLines: 4 };
  return wrapText(base, wrap);
};

const normalizeDesignKey = (id) => {
  const raw = String(id || "")
    .trim()
    .toUpperCase()
    .replace(/^OH-[A-Z]+-/, "");

  return raw
    .replace(/-(DAD|BEANIE|SNAP)$/i, "")
    .replace(/[^A-Z0-9]/g, "");
};

const DESIGN_PRESETS = {
  WHIPITOUT: {
    template: "poster",
    icon: "micWhip",
    accent: "#3b82f6",
    topLines: ["WHEN IN DOUBT,"],
    bottomLines: ["WHIP IT OUT"],
  },
  FACTCHECKPRES: {
    template: "poster",
    icon: "checkStamp",
    accent: "#8b5cf6",
    topLines: ["FACT CHECKING"],
    bottomLines: ["PRESIDENTS"],
  },
  CHURCHSTATE: {
    template: "poster",
    icon: "scale",
    accent: "#60a5fa",
    topLines: ["SEPARATION OF"],
    bottomLines: ["CHURCH", "& STATE"],
  },
  TWOPARTIES: {
    template: "poster",
    icon: "headache",
    accent: "#f97316",
    topLines: ["TWO PARTIES."],
    bottomLines: ["ONE HEADACHE."],
  },
  TAXBEHAVES: {
    template: "poster",
    icon: "coin",
    accent: "#60a5fa",
    topLines: ["DEMOCRATS"],
    bottomLines: ["TAX IT", "TIL IT BEHAVES"],
  },
  PLANANNOUNCE: {
    template: "poster",
    icon: "clipboard",
    accent: "#3b82f6",
    topLines: ["DEMOCRATS"],
    bottomLines: ["WE HAVE A PLAN", "TO ANNOUNCE A PLAN"],
  },
  DEREGEXPLODES: {
    template: "poster",
    icon: "gearBurst",
    accent: "#ef4444",
    topLines: ["REPUBLICANS"],
    bottomLines: ["DEREGULATE IT", "TIL IT EXPLODES"],
  },
  RULES4THEE: {
    template: "poster",
    icon: "rulebook",
    accent: "#f97316",
    topLines: ["REPUBLICANS"],
    bottomLines: ["FREEDOM FOR ME", "RULES FOR THEE"],
  },
  READBILLS: {
    template: "poster",
    icon: "docGlasses",
    accent: "#22c55e",
    topLines: ["I READ BILLS"],
    bottomLines: ["SO YOU DON'T", "HAVE TO"],
  },
  FREESPEECHTYPOS: {
    template: "poster",
    icon: "megaphonePencil",
    accent: "#06b6d4",
    topLines: ["FREE SPEECH,"],
    bottomLines: ["NOT FREE TYPOS"],
  },
  PRESSBINGO: {
    template: "poster",
    icon: "bingo",
    accent: "#a855f7",
    topLines: ["PRESS CONFERENCE"],
    bottomLines: ["BINGO"],
  },
  CANCELNAP: {
    template: "poster",
    icon: "pillow",
    accent: "#60a5fa",
    topLines: ["CANCEL ME,"],
    bottomLines: ["I NEED A NAP"],
  },
  RESPECTFULLYNO: {
    template: "poster",
    icon: "stop",
    accent: "#ef4444",
    topLines: ["RESPECTFULLY..."],
    bottomLines: ["NO."],
  },
  BORINGAGAIN: {
    template: "poster",
    icon: "zzzMoon",
    accent: "#8b5cf6",
    topLines: ["MAKE POLITICS"],
    bottomLines: ["BORING AGAIN"],
  },
  OFFENDEDATTN: {
    template: "poster",
    icon: "eye",
    accent: "#38bdf8",
    topLines: ["IF YOU'RE OFFENDED,"],
    bottomLines: ["YOU'RE PAYING", "ATTENTION"],
  },
  THOUGHTSPRAYERS: {
    template: "poster",
    icon: "hourglass",
    accent: "#f59e0b",
    topLines: ["THOUGHTS", "& PRAYERS"],
    bottomLines: ["PENDING", "APPROVAL"],
  },
  OVERREACTED: {
    template: "poster",
    icon: "explosion",
    accent: "#fb7185",
    topLines: ["I CAME, I SAW,"],
    bottomLines: ["I OVERREACTED"],
  },
  MILDLYUNHINGED: {
    template: "poster",
    icon: "hinge",
    accent: "#c4b5fd",
    topLines: ["MILDLY"],
    bottomLines: ["UNHINGED"],
  },
  UNSUBSCRIBE: {
    template: "poster",
    icon: "envelopeSlash",
    accent: "#22c55e",
    topLines: ["UNSUBSCRIBE"],
    bottomLines: ["FROM THIS", "ENERGY"],
  },
  PRESSSURVIVOR: {
    template: "poster",
    icon: "podium",
    accent: "#93c5fd",
    topLines: ["PRESS CONFERENCE"],
    bottomLines: ["SURVIVOR"],
  },
  COMEDYCARDIO: {
    template: "poster",
    icon: "heartMic",
    accent: "#a855f7",
    topLines: ["COMEDY IS MY"],
    bottomLines: ["CARDIO"],
  },
};

const getDesignPreset = ({ id }) => {
  const key = normalizeDesignKey(id);
  return DESIGN_PRESETS[key] || null;
};

rows.forEach((row) => {
  const id = String(row.id || "").trim();
  if (!id) return;

  const itemType = itemTypeFromId(id);
  const title = stripProductSuffix(row.title || "");
  const slug = slugFromId(id);
  const design = getDesignPreset({ id });

  if (isSpecial(id)) {
    const designs =
      id === "OH-TEE-SPERMDONOR"
        ? {
            baseName: "oh-tee-spermdonor",
            lines: ["SPERM", "DONOR"],
            design: null,
          }
        : {
            baseName: "oh-tee-orgasmdonor",
            lines: ["ORGASM", "DONOR"],
            design: { icon: "winkFace", accent: "#dc2626" },
          };

    ["white", "black"].forEach((shirtColor) => {
      const svg = buildMockupSvg({
        title,
        itemType,
        shirtColor,
        printColor: "#dc2626",
        lines: designs.lines,
        emblem: true,
        design: designs.design,
      });

      const fileName = `${designs.baseName}-${shirtColor}.svg`;
      fs.writeFileSync(path.join(outDir, fileName), svg);
    });

    return;
  }

	  const svg = buildMockupSvg({
	    title,
	    itemType,
	    shirtColor: "black",
	    printColor: "#ffffff",
	    lines: buildDefaultLines({ id, title: row.title }),
	    emblem: false,
	    design,
	  });

  fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg);
});

// eslint-disable-next-line no-console
console.log(`Generated mockups in ${path.relative(process.cwd(), outDir)}`);
