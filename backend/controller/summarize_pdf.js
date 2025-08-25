import { summarize_text } from "./summarize_text.js";
import { PDFExtract } from 'pdf.js-extract';
import fs from 'fs/promises';
const pdfExtract = new PDFExtract();

const options = {
    lastPage: 3  
}; 


export async function summarize_pdf(pdf_buffer) {
    try {
        
        return new Promise((resolve, reject) => {
            pdfExtract.extractBuffer(pdf_buffer, options, async (err, data) => {
                if (err) return reject(err);
                try {
                    let summary = ``;
                    for(let i=0; i<data.pages.length; i++){
                        let page = data.pages[i];
                        let pageText = page.content.map(item => item.str).join(' ');
                        await summarize_text(pageText).then((result)=>{
                            summary += result + " ";
                        });
                    }
                    resolve(summary);
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

// Streaming version: Use Server-Sent Events (SSE) to stream summary chunks
export async function summarize_pdf_sse(pdf_buffer, res) {
    try {
        return new Promise((resolve, reject) => {
            pdfExtract.extractBuffer(pdf_buffer, options, async (err, data) => {
                if (err) return reject(err);
                try {
                    for(let i=0; i<data.pages.length; i++){
                        let page = data.pages[i];
                        let pageText = page.content.map(item => item.str).join(' ');
                        let result = await summarize_text(pageText);
                        console.log('Sending chunk:', result);
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