// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';
import { write } from 'node:fs';

// Import other required libraries
import { writeFile } from 'node:fs/promises';

async function tts() {
  // The text to synthesize
  // const text = 'Oh My God! is this for real? Wait, did you guys, come on! God, I LOVEEEEEE this!';
  const text = 'I read a book, and I will now read it to you.';
  
  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();
  const outputFile = './outputAA.mp3';

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: 'en-US', name: 'en-US-Chirp-HD-F', ssmlgender: 'FEMALE'},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);

  // Save the generated binary audio content to a local file
  await writeFile(outputFile, response.audioContent, 'binary');
  console.log(`Audio content written to file: ${outputFile}`);
}

await tts();

/**  
  Good Voices:
  1) en-IN; FEMALE: en-IN-Chirp3-HD-Laomedeia
  2) en-US; FEMALE: en-US-Chirp-HD-F
  3) en-GB; FEMALE: en-GB-Chirp3-HD-Sulafat
**/




