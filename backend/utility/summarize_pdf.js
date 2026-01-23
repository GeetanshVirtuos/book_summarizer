import { summarize_text, summarize_text_llm } from "./summarize_text.js";
import { PDFExtract } from 'pdf.js-extract';
import fs from 'fs/promises';
import { resolve } from "path";
import { rejects } from "assert";
import { logger, LOG_TYPES } from './logger.js';
const pdfExtract = new PDFExtract();



// Returns a summary of `entire_book` aiming for `targetWords` words.
// - If `res` is provided and headers are not sent, the function will send { summary } to the client.
// - Options:
//    - chunkWords (default 20000): how many words to feed to summarize_text_llm at once.
//    - maxIterations (default 3): safety cap for iterative summarization.
// Usage example:
//    const summary = await summarize_pdf_target(fullText, null, 500);
//    // or to auto-send: await summarize_pdf_target(fullText, res, 200);
export async function summarize_pdf_target(entire_book, res = null, targetWords = 20000, options = {}) {
  const CHUNK_WORDS = options.chunkWords || 20000;     // how many words per summarize_text_llm call
  const MAX_ITERATIONS = options.maxIterations || 3; // avoid infinite loops
  const MIN_TARGET = 1; // minimal allowed target

  // basic validation
  if (entire_book == null) throw new Error("No book text provided");
  if (!Number.isFinite(targetWords) || targetWords < MIN_TARGET) {
    throw new Error("Invalid targetWords; must be a positive number");
  }

  // helper: split text into words robustly
  const toWords = (s) => (s || "").split(/\s+/).filter(Boolean);

  // helper: sequentially summarize an array of words in CHUNK_WORDS sized batches
  const summarizeChunks = async (wordsArray) => {
    let accumulated = "";
    for (let i = 0; i < wordsArray.length; i += CHUNK_WORDS) {
      const slice = wordsArray.slice(i, i + CHUNK_WORDS);
      if (slice.length === 0) continue;
      const chunkText = slice.join(" ");
      // NOTE: summarize_text_llm is treated as a black box that returns the complete summary string for the chunk.
      const s = await summarize_text_llm(chunkText);
      if (s && s.toString().trim()) {
        accumulated += (accumulated ? " " : "") + s.toString().trim();
      }
    }
    return accumulated;
  };

  // First pass: chunk+summarize the whole book
  const allWords = toWords(entire_book);
  if (allWords.length === 0) {
    // empty input -> empty output
    if (res && !res.headersSent) res.send({ summary: "" });
    return "";
  }

  let summary = "";
  try {
    if (allWords.length <= CHUNK_WORDS) {
      summary = await summarize_text_llm(allWords.join(" "));
    } else {
      summary = await summarizeChunks(allWords);
    }
  } catch (err) {
    // bubble up and optionally send HTTP 500 if res provided
    if (res && !res.headersSent) res.status(500).send({ error: err.message || String(err) });
    throw err;
  }

  // Iteratively compress the summary until it is <= targetWords or we hit the iteration cap
  let iter = 0;
  while (toWords(summary).length > targetWords && iter < MAX_ITERATIONS) {
    iter++;
    const summaryWords = toWords(summary);
    try {
      if (summaryWords.length <= CHUNK_WORDS) {
        summary = await summarize_text_llm(summaryWords.join(" "));
      } else {
        summary = await summarizeChunks(summaryWords);
      }
    } catch (err) {
      if (res && !res.headersSent) res.status(500).send({ error: err.message || String(err) });
      throw err;
    }
  }

  // Final safety truncation: if still longer than target, truncate to first targetWords words
  const finalWords = toWords(summary);
  if (finalWords.length > targetWords) {
    summary = finalWords.slice(0, targetWords).join(" ") + " ...";
  }

//   Optionally send result via Express res
//   if (res && !res.headersSent) {
//     try {

//       // send summary as HTML (TODO: make an LLM call here)
//       let html_summary = 
//       res.send({ summary: html_summary });
//     } catch (sendErr) {
//       // swallow send error but still return summary
//       console.warn("Failed to send response:", sendErr);
//     }
//   }

  return summary; // As the function is "async", it actually returns a promise that resolves to "summary"
}


// Streaming version: Use Server-Sent Events (SSE) to stream summary chunks
// Also called progressive summary
export async function summarize_pdf_sse(pdf_buffer, res) {
    try {
        return new Promise((resolve, reject) => {
            const options = {
                lastPage: 20  
            }; 
            pdfExtract.extractBuffer(pdf_buffer, options, async (err, data) => {
                if (err) return reject(err);
                try {
                    for(let i=0; i<data.pages.length; i++){
                        if(data.pages.length >= 7 && i<5) continue; // Skip first 5 pages for books as they often contain Index or preface
                        let page = data.pages[i];
                        let pageText = page.content.map(item => item.str).join(' ');
                        let result = await summarize_text(pageText);
                        logger(`Sending chunk: ${result}`, LOG_TYPES.INFORMATION);
                        res.write(`data: ${result}\n\n`);
                        // Optionally flush if available
                        if (res.flush) res.flush();
                    }
                    res.end();
                    resolve("Streaming complete");
                } catch (error) {
                    reject(error);
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

// Example usage: Read the PDF file into a buffer
// const buffer = await fs.readFile('./sample_pdfs/pg_3_sample.pdf');
// summarize_pdf(buffer).then((result)=>{
//     console.log("PDF Summary:", result);
// }).catch((error)=>{
//     console.error("Error summarizing PDF:", error);
// });



