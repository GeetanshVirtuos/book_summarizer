import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import ollama from 'ollama'
import { logger, LOG_TYPES } from './logger.js';

// Function 1: summarize text using facebook/bart-large-cnn
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
            logger(`Error from Python script: ${error}`, LOG_TYPES.ERROR);
        });

        py.on("close", (code) => {
            logger(`Python exited with code ${code}`, LOG_TYPES.INFORMATION);
        });
    });
}

// Function 2: summarize text using LLM
export async function summarize_text_llm(text='Sample Text: This is sample text, please provide your own text!', model='gemma3:12b'){

    let content = `I am providing you a TEXT and your task is to extract the crux of it and generate a summary in about 4 pages. You can choose a paragraph style summary with continuous text, synopsis style summary with Headings, Subheadings, points or a hybrid of the two depending on the TEXT.\nOutput only the summarized version, no extra instructions, questions, warnings etc.\n\n[TEXT START]\n\n${text}\n\n[TEXT END]`
    
    return new Promise(async (resolve, reject) => {
        try {
            logger(`Starting text summarization with model: ${model}`, LOG_TYPES.INFORMATION);
            const response = await ollama.chat({
                model: model,
                stream: false,
                messages: [{ role: 'user', content: content }],
                "options": {
                    "num_ctx": 32224,
                    "timeout": 300000  // 5 minutes timeout
                }
            })
            logger('Text summarization completed successfully', LOG_TYPES.SUCCESS);
            resolve(response.message.content)
        } catch (error) {
            logger(`Error in summarize_text_llm: ${error.message}`, LOG_TYPES.ERROR);
            reject(error);
        }
    })
}



