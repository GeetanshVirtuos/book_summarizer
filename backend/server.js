import { summarize_text } from "./utility/summarize_text.js";
import { summarize_pdf_target, summarize_pdf_sse } from "./utility/summarize_pdf.js";
import { aws } from "./utility/aws.js";
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFExtract } from 'pdf.js-extract';
import { format_text_to_html_llm } from "./utility/format_text.js";
import { writeFile } from 'node:fs/promises';
import { PollyClient, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";

const pdfExtract = new PDFExtract();
const app = express();
const port = 3000;

app.use(express.static('public'))
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

// Add CORS for "http://localhost:5173"
app.use(cors({
    origin: "http://localhost:5173"
    // origin: "http://127.0.0.1:3002"
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
            if(aws.styled_summary === ""){            
                const options = {
                    lastPage: 20
                }; 

                pdfExtract.extractBuffer(pdf_buffer, options, async(err, data) => {
                    let entire_book = '';

                    // for(let i=0; i<data.pages.length; i++){
                    //         if(data.pages.length >= 7 && i<5) continue; // Skip first 5 pages for books as they often contain Index or preface
                    //         let page = data.pages[i];
                    //         entire_book += page.content.map(item => item.str).join(' ');
                    // }
                    
                    // let summary = await summarize_pdf_target(entire_book, res); 
                    let summary = `
    ## The Unconventional Life of the Dursleys and the Arrival of a Secret

    The story begins with the Dursleys, a seemingly ordinary couple residing at number four, Privet Drive. They pride themselves on their normalcy and vehemently reject anything unconventional or mysterious. Mr. Dursley, a stout man and director of a drill-making firm, and his thin, blonde wife, Mrs. Dursley, obsessed with observing their neighbors, appear to embody the ideal of suburban respectability. Their world revolves around their son, Dudley, whom they consider to be the epitome of perfection. However, beneath this veneer of normalcy lies a significant secret and a profound fear: the existence of their sister, Mrs. Potter, and her family, whom they strive desperately to keep hidden from public knowledge.

    The Dursleys’ discomfort with the Potters stems from a deep-seated disdain for anything that deviates from their carefully constructed worldview. They actively deny the existence of Mrs. Potter, dismissing her and her husband as "unDursleyish." They are particularly anxious about the potential impact of the Potters, including their son, on Dudley’s standing within their tightly controlled social circle. The Dursleys fear what their neighbors would think if the Potters were to appear in their street, a prospect they find utterly unbearable. They keep the Potter’s son completely separate from Dudley.

    The narrative opens on a typical, unremarkable Tuesday morning. Mr. Dursley prepares for work, while Mrs. Dursley struggles to contain Dudley's morning tantrum. A fleeting moment of the unusual – a tawny owl flying past – goes unnoticed by the preoccupied Dursleys. As Mr. Dursley drives to work, he encounters an even more unsettling occurrence: a cat reading a map. This minor, inexplicable event serves as the first indication that the seemingly predictable world of the Dursleys is about to be disrupted. 

    Ten years have elapsed since the Dursleys reluctantly took in their nephew, a secret they’ve guarded fiercely. Privet Drive remains much as it always has, a picture of suburban tranquility. The physical appearance of the Dursleys' home reflects a passage of time through photographs on the mantelpiece; once dominated by images of a baby resembling a pink beach ball wearing bonnets, these have been replaced by pictures of Dudley growing up: riding a bicycle, playing computer games with his father, and receiving affection from his mother. Crucially, the photographs do not depict any sign of a second boy residing within the household, reinforcing the Dursleys' determined effort to isolate their nephew from the rest of the world and maintain the illusion of a conventionally normal family unit.



    ## A Life Built on Secrets

    The Dursleys' insistence on being “perfectly normal” is not merely a matter of personal preference; it's a carefully constructed defense mechanism against a world they perceive as chaotic and unpredictable. Their fear of the Potters isn't simply a matter of social embarrassment; it’s rooted in a deeper anxiety about exposure – the potential revelation of a truth that would shatter their carefully maintained facade of respectability and control. Their rejection of the Potters is not just an act of exclusion; it's a deliberate attempt to control the narrative and shape their own reality. 

    Their existence revolves around maintaining order and normalcy, and the presence of a family associated with magic directly threatens that. The Potters represent a world outside of their understanding and control, a world they actively reject and attempt to suppress. This rejection is not based on malice alone, but rather on a desperate need to protect their own fragile sense of self and their carefully constructed world. The Potters’ existence, and by extension, their son’s, represents a disruption of the Dursley’s own idealized version of reality, and it’s a disruption they desperately try to avoid.



    ## A World on the Brink of Change

    The small detail of the cat reading a map, initially dismissed by Mr. Dursley, foreshadows a profound shift in the established order. The very foundations of the Dursleys' reality are poised to be challenged, and their carefully maintained illusion of normalcy is about to crumble. The seemingly innocuous events occurring at the beginning of the narrative – the owl flying past, the cat reading a map – are subtle hints of a larger, more magical world encroaching upon their mundane existence.

    The story sets the stage for a narrative centered on the clash between the mundane and the magical, between the desire for normalcy and the inevitability of change. The Dursleys’ rigid adherence to their self-imposed standards of normality creates a fertile ground for conflict, as the forces they attempt to suppress inevitably break through, disrupting their carefully controlled world and exposing the fragility of their carefully constructed reality. The initial quiet and order of Privet Drive belies the extraordinary events that are about to unfold, signaling the imminent arrival of a force that will forever alter the Dursleys' lives.
                    `
                    aws.summary = summary;
                    
                    let html_summary = await format_text_to_html_llm(summary);
                    aws.styled_summary = html_summary;
                    res.send({ summary: html_summary });
                    
                    // Requirements keep shifting, for now, there is just 1 type of summary : 2 - 3 page version
                    // if(summary_type == "g"){
                    //     summarize_pdf_target(entire_book, res, 200); //Return gist
                    // }
                    // else if(summary_type == "o"){
                    //     summarize_pdf_target(entire_book, res, 500);  //Return one page target
                    // }
                    // else if(summary_type == "a"){
                    //     // Return abridged summary: 2% of entire book length
                    //     const abridgedTarget = Math.max(1, Math.floor(entire_book.length * 0.02)); 
                    //     summarize_pdf_target(entire_book, res, abridgedTarget);
                    // }
                    // else{
                    //     res.status(400).send({ error: "Invalid summary type requested" });
                    // }
                    //Note: "summarize_pdf_target()" calls res.end() itself
                })   
            } else {
                res.send({summary: aws.styled_summary})
            }   
        }

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get("/audioLink", async (req, res) => {
    // Update connection to SSE streams
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client
    
    res.on('close', () => {
        console.log('client dropped connection!');
        res.end();
    });
    
    if(aws.audio_link === ""){
        try{
            const pollyClient = new PollyClient({region: "us-east-1"});
            const startSpeechSynthesisTaskCommand = new StartSpeechSynthesisTaskCommand({
                Engine: "generative",
                Text: `${aws.summary}`,
                VoiceId: "Danielle",
                OutputFormat: "mp3",
                OutputS3BucketName: "readly-development2"
            });
            const response = await pollyClient.send(startSpeechSynthesisTaskCommand);
            let TaskId = response.SynthesisTask.TaskId 
            console.log(`Speech Synthesis task started. TaskId: ${TaskId} \n`);
            let pollTime = 1000; // In milliseconds 
            let endPoll = false;
            
            while(pollTime <= 32000 && !endPoll){
                await new Promise((resolve, reject) => {
                    setTimeout(async ()=>{
                        //Poll AWS for progress             
                        try{
                            const command = new GetSpeechSynthesisTaskCommand({
                                TaskId: TaskId,
                            });
                            const aws_response = await pollyClient.send(command);

                            if(aws_response.SynthesisTask.TaskStatus === "completed"){
                                res.write("event: audio_synthesis_done\n")
                                res.write(`data: {"audio_url": "${aws_response.SynthesisTask.OutputUri}"}`)
                                res.write('\n\n')
                                aws.audio_link = aws_response.SynthesisTask.OutputUri;
                                endPoll = true;
                            } else if(aws_response.SynthesisTask.TaskStatus === "inProgress") {
                                res.write("event: audio_synthesis_inProgress\n")
                                res.write("data: {}\n");
                                res.write('\n\n')
                            }
                            
                            resolve("AWS call made.")
                        } catch (error){
                            console.error("Error retrieving task. TaskID might be incorrect", error);
                            resolve("AWS call not made.")
                            // endPoll = true; // endPoll here if you want to!
                        }
                        pollTime *= 2;

                        //Code below is just to test SSE implementation
                        // if(pollTime <= 4000){
                        //     res.write("event: audio_synthesis_done\n")
                        //     res.write(`data: {"OutputUri": "NOT YET"}`)
                        //     res.write('\n\n')
                        // } else{
                        //     res.write("event: audio_synthesis_done\n")
                        //     res.write(`data: {"OutputUri": "YUP"}`)
                        //     res.write('\n\n')
                        // }
                        // resolve()
                        // pollTime *= 2;
                    }, pollTime);  
                })
            }
        } catch (error) {
            console.log(`Error in starting audio synthesis task: ${error}`)
            res.write("event: error_in_audio_synthesis\n")
            res.write("data: {}\n");
            res.write('\n\n')
        }

        // If client closes connection, stop sending events
    } else {
        res.write("event: audio_synthesis_done\n")
        res.write(`data: {audio_url: "${aws.audio_link}"}`)
        res.write('\n\n')
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






