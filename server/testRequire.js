import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
console.log("KEYS:", Object.keys(pdfParse));
if (typeof pdfParse === 'function') console.log("Is function");
if (typeof pdfParse.default === 'function') console.log("Has default function");
