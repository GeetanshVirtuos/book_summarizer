import { summarize_text } from "./controller/summarize_text.js";

console.log("Starting text summarization...");


let text = `Hi, My name is Geetansh`;
await summarize_text(text);