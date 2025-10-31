// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';
import { write } from 'node:fs';

// Import other required libraries
import { writeFile } from 'node:fs/promises';

async function tts() {
  // The text to synthesize
  // const text = 'Oh My God! is this for real? Wait, did you guys, come on! God, I LOVEEEEEE this!';
  const text = `
The Unconventional Life of the Dursleys and the Arrival of a Secret

The story begins with the Dursleys, a seemingly ordinary couple residing at number four, Privet Drive. They pride themselves on their normalcy and vehemently reject anything unconventional or mysterious. Mr. Dursley, a stout man and director of a drill-making firm, and his thin, blonde wife, Mrs. Dursley, obsessed with observing their neighbors, appear to embody the ideal of suburban respectability. Their world revolves around their son, Dudley, whom they consider to be the epitome of perfection. However, beneath this veneer of normalcy lies a significant secret and a profound fear: the existence of their sister, Mrs. Potter, and her family, whom they strive desperately to keep hidden from public knowledge.

The Dursleys’ discomfort with the Potters stems from a deep-seated disdain for anything that deviates from their carefully constructed worldview. They actively deny the existence of Mrs. Potter, dismissing her and her husband as "unDursleyish." They are particularly anxious about the potential impact of the Potters, including their son, on Dudley’s standing within their tightly controlled social circle. The Dursleys fear what their neighbors would think if the Potters were to appear in their street, a prospect they find utterly unbearable. They keep the Potter’s son completely separate from Dudley.
  `;
  
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




