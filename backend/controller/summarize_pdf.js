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
            pdfExtract.extractBuffer(buffer, options, async (err, data) => {
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

// Read the PDF file into a buffer
const buffer = await fs.readFile('./pg_3_sample.pdf');

summarize_pdf(buffer).then((result)=>{
    console.log("PDF Summary:", result);
}).catch((error)=>{
    console.error("Error summarizing PDF:", error);
});