// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';

async function callListVoices() {
    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();
    // Construct request
    const request = {
        languageCode: 'en-IN'
    };

    // Run request
    const response = await client.listVoices(request);
    // console.log(response);
    return response;
    }

let res = await callListVoices();
for (let voice_index in res[0].voices){
    console.log(res[0].voices[voice_index]);
}