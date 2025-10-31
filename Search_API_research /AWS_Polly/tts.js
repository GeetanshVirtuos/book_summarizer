import { PollyClient, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand } from "@aws-sdk/client-polly";
import { writeFile } from "fs/promises";
// import { S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";

export const handler = async () => {
    const pollyClient = new PollyClient({region: "us-east-1"});

    const startSpeechSynthesisTaskCommand = new StartSpeechSynthesisTaskCommand({
    Engine: "generative",
    Text: `## The Unconventional Life of the Dursleys and the Arrival of a Secret\r\n\r\nThe story begins with the Dursleys, a seemingly ordinary couple residing at number four, Privet Drive. They pride themselves on their normalcy and vehemently reject anything unconventional or mysterious. Mr. Dursley, a stout man and director of a drill-making firm, and his thin, blonde wife, Mrs. Dursley, obsessed with observing their neighbors, appear to embody the ideal of suburban respectability. Their world revolves around their son, Dudley, whom they consider to be the epitome of perfection. However, beneath this veneer of normalcy lies a significant secret and a profound fear: the existence of their sister, Mrs. Potter, and her family, whom they strive desperately to keep hidden from public knowledge.\r\n\r\nThe Dursleys\u2019 discomfort with the Potters stems from a deep-seated disdain for anything that deviates from their carefully constructed worldview. They actively deny the existence of Mrs. Potter, dismissing her and her husband as \"unDursleyish.\" They are particularly anxious about the potential impact of the Potters, including their son, on Dudley\u2019s standing within their tightly controlled social circle. The Dursleys fear what their neighbors would think if the Potters were to appear in their street, a prospect they find utterly unbearable. They keep the Potter\u2019s son completely separate from Dudley.\r\n\r\nThe narrative opens on a typical, unremarkable Tuesday morning. Mr. Dursley prepares for work, while Mrs. Dursley struggles to contain Dudley's morning tantrum. A fleeting moment of the unusual \u2013 a tawny owl flying past \u2013 goes unnoticed by the preoccupied Dursleys. As Mr. Dursley drives to work, he encounters an even more unsettling occurrence: a cat reading a map. This minor, inexplicable event serves as the first indication that the seemingly predictable world of the Dursleys is about to be disrupted. \r\n\r\nTen years have elapsed since the Dursleys reluctantly took in their nephew, a secret they\u2019ve guarded fiercely. Privet Drive remains much as it always has, a picture of suburban tranquility. The physical appearance of the Dursleys' home reflects a passage of time through photographs on the mantelpiece; once dominated by images of a baby resembling a pink beach ball wearing bonnets, these have been replaced by pictures of Dudley growing up: riding a bicycle, playing computer games with his father, and receiving affection from his mother. Crucially, the photographs do not depict any sign of a second boy residing within the household, reinforcing the Dursleys' determined effort to isolate their nephew from the rest of the world and maintain the illusion of a conventionally normal family unit.\r\n\r\n\r\n\r\n## A Life Built on Secrets\r\n\r\nThe Dursleys' insistence on being \u201Cperfectly normal\u201D is not merely a matter of personal preference; it's a carefully constructed defense mechanism against a world they perceive as chaotic and unpredictable. Their fear of the Potters isn't simply a matter of social embarrassment; it\u2019s rooted in a deeper anxiety about exposure \u2013 the potential revelation of a truth that would shatter their carefully maintained facade of respectability and control. Their rejection of the Potters is not just an act of exclusion; it's a deliberate attempt to control the narrative and shape their own reality. \r\n\r\nTheir existence revolves around maintaining order and normalcy, and the presence of a family associated with magic directly threatens that. The Potters represent a world outside of their understanding and control, a world they actively reject and attempt to suppress. This rejection is not based on malice alone, but rather on a desperate need to protect their own fragile sense of self and their carefully constructed world. The Potters\u2019 existence, and by extension, their son\u2019s, represents a disruption of the Dursley\u2019s own idealized version of reality, and it\u2019s a disruption they desperately try to avoid.\r\n\r\n\r\n\r\n## A World on the Brink of Change\r\n\r\nThe small detail of the cat reading a map, initially dismissed by Mr. Dursley, foreshadows a profound shift in the established order. The very foundations of the Dursleys' reality are poised to be challenged, and their carefully maintained illusion of normalcy is about to crumble. The seemingly innocuous events occurring at the beginning of the narrative \u2013 the owl flying past, the cat reading a map \u2013 are subtle hints of a larger, more magical world encroaching upon their mundane existence.\r\n\r\nThe story sets the stage for a narrative centered on the clash between the mundane and the magical, between the desire for normalcy and the inevitability of change. The Dursleys\u2019 rigid adherence to their self-imposed standards of normality creates a fertile ground for conflict, as the forces they attempt to suppress inevitably break through, disrupting their carefully controlled world and exposing the fragility of their carefully constructed reality. The initial quiet and order of Privet Drive belies the extraordinary events that are about to unfold, signaling the imminent arrival of a force that will forever alter the Dursleys' lives.`,
    VoiceId: "Danielle",
    OutputFormat: "mp3",
    OutputS3BucketName: "readly-development2"
    });

    // const response = await pollyClient.send(startSpeechSynthesisTaskCommand);
    // console.log(typeof response);
    // console.log('\n\n\n');
    // console.log(response);
  
    // // Save asynchronously as MP3
    // const bytes = await AudioStream.transformToByteArray();
    // await writeFile("./output.mp3", Buffer.from(bytes));
    // console.log("✅ MP3 saved as output.mp3");

    
    // Store the audio file in S3.
    // const audioKey = `${file_name}.mp3`;    
    // const s3Client = new S3Client();
    // const upload = new Upload({
    // client: s3Client,
    // params: {
    //     Bucket: sourceDestinationConfig.bucket,
    //     Key: audioKey,
    //     Body: AudioStream,
    //     ContentType: "audio/mp3",
    // },
    // });

    // await upload.done();
    // return audioKey;

    // Get speech Synthesis Task Progress
    // const command = new GetSpeechSynthesisTaskCommand({
    //     TaskId: "9c7071d9-2bde-4af4-b282-86318621b637",
    // });

    // try {
    //     const response = await pollyClient.send(command);
    //     console.log(response);
    // } catch (error) {
    //     console.error("Error retrieving task:", error);
    // }
};

handler();

