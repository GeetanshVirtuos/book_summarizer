// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';

// Takes "text" as input, returns "MP3" encoded audio (in bytes)
export async function tts(text, languageCode, voice_name, ssmlgender) {
  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();

  // Construct the request
  const request = {
    input: {text: text},
    // Select the language and SSML voice gender (optional)
    voice: {languageCode: languageCode, name: voice_name, ssmlgender: ssmlgender},
    // select the type of audio encoding
    audioConfig: {audioEncoding: 'MP3'},
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  return response;
}

// await tts();

/**  
  Good Voices:
  1) en-IN; FEMALE: en-IN-Chirp3-HD-Laomedeia
  2) en-US; FEMALE: en-US-Chirp-HD-F
  3) en-GB; FEMALE: en-GB-Chirp3-HD-Sulafat
**/



