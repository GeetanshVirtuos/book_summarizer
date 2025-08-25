import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
// console.log("__filename:", __filename);
const __dirname = path.dirname(__filename);
// console.log("__dirname:", __dirname);

// cross-platform venv python path
const venvPython = path.join(__dirname, "..", "..", "ml_engine", "Mlvenv", "bin", "python3.12");
// console.log("Venv Python Path:", venvPython);

export async function summarize_text(text) {
    return new Promise((resolve, reject) => {
        // spawn python process from venv
        const py = spawn(venvPython, [path.join(__dirname, "..", "..", "ml_engine", "summarize_text_cli.py"), "--text", text]);

        let result = '';
        let error = '';

        py.stdout.on("data", (data) => {
            result += data.toString();
            resolve(result);
        });

        py.stderr.on("data", (data) => {
            error += data.toString();
            console.error("Error from Python script:", error);
        });

        py.on("close", (code) => {
            console.log(`Python exited with code ${code}`);
        });
    });
}

