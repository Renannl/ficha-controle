import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const logo = fs.readFileSync(
  path.join(__dirname, "../public/logo-induspower.png")
);

console.log(`data:image/png;base64,${logo.toString("base64")}`);
