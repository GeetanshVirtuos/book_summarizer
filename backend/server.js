import { summarize_text } from "./controller/summarize_text.js";
import { summarize_pdf_target, summarize_pdf_sse } from "./controller/summarize_pdf.js";
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFExtract } from 'pdf.js-extract';

const pdfExtract = new PDFExtract();
const app = express();
const port = 3000;

app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Add CORS for "http://localhost:5173"
app.use(cors({
    origin: 'http://localhost:5173'
}));


app.get('/', (req, res) => {
  res.send('Hello World! Welcome to the book Summarizer backend.')
})

/***** Summarize Text **********/
app.post('/summarize_text', (req, res) => {
    let text = req.body.text;
    summarize_text(text).then((result)=>{
        res.send({summary: result});
    }).catch((error)=>{
        res.status(500).send({error: error.message});   
    });
});

/***** Summarize PDF : gist/one page/abridged/progressive summary **********/
app.post('/summarize_pdf', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ error: "No PDF file uploaded." });
        }

        const pdf_buffer = req.file.buffer;
        let summary_type = req.query.summary_type
        if(summary_type == "ps"){
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            summarize_pdf_sse(pdf_buffer, res);
        }
        else{
            const options = {
                lastPage: 20
            }; 

            pdfExtract.extractBuffer(pdf_buffer, options, async(err, data) => {
                let entire_book = '';

                for(let i=0; i<data.pages.length; i++){
                        if(data.pages.length >= 7 && i<5) continue; // Skip first 5 pages for books as they often contain Index or preface
                        let page = data.pages[i];
                        entire_book += page.content.map(item => item.str).join(' ');
                }
                
                if(summary_type == "g"){
                    summarize_pdf_target(entire_book, 200, res); //Return gist
                }
                else if(summary_type == "o"){
                    summarize_pdf_target(entire_book, 500, res);  //Return one page target
                }
                else if(summary_type == "a"){
                    // Return abridged summary: 2% of entire book length
                    const abridgedTarget = Math.max(1, Math.floor(entire_book.length * 0.02)); 
                    summarize_pdf_target(entire_book, abridgedTarget, res);
                }
                else{
                    res.status(400).send({ error: "Invalid summary type requested" });
                }
                //Note: "summarize_pdf_target()" calls res.end() itself
            })            
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Example usage
// let text = `Crayon Shin-chan (Japanese: クレヨンしんちゃん, Hepburn: Kureyon Shin-chan) is a Japanese manga series written and illustrated by Yoshito Usui. Crayon Shin-chan made its first appearance in 1990 in a Japanese weekly magazine called Weekly Manga Action, which was published by Futabasha. Due to the death of author Yoshito Usui, the manga in its original form ended on September 11, 2009. A new manga began in the summer of 2010 by members of Usui's team,[6] titled New Crayon Shin-chan (新クレヨンしんちゃん, Shin Kureyon Shin-chan).

// An animated television adaptation began airing on TV Asahi in 1992 and is still ongoing, with over 1200 episodes. The show has been dubbed in 30 languages which aired in 45 countries.[7] As of 2023, both the Crayon Shin-Chan and New Crayon Shin-Chan series has over 148 million copies in circulation, making it among the best-selling manga series in history.

// Synopsis
// Main article: List of Crayon Shin-chan characters

// Train in special Crayon Shin-chan vinyl wrapping livery at Kurihashi Station, Japan
// Set in the city of Kasukabe of Saitama Prefecture within the Greater Tokyo Area of Japan, the series follows the adventures of the five-year-old Shinnosuke "Shin" Nohara and his parents, baby sister, dog, neighbours, and best friends. Most of the plot is about Shin-chan's daily life, but it is also often interspersed with a lot of fantastic and incredible elements.

// Many of the jokes in the series stem from Shin-chan's occasionally weird, unnatural and inappropriate use of language, as well as from his mischievous behaviour. `;
// summarize_text(text).then((result)=>{
//     console.log("Result from Python script:", result);
// });`