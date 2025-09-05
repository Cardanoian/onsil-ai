import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from '@google/genai';

const ai = new GoogleGenAI({});

// Multi Modal을 이용한 Gemini Text 생성 예시
async function multiModal(prompt) {
  const image = await ai.files.upload({
    file: '/path/to/organ.png',
  });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    config: { thinkingConfig: { thinkingBudget: 0 } },
    contents: [
      createUserContent([prompt, createPartFromUri(image.uri, image.mimeType)]),
    ],
  });
  console.log(response.text);
}

await multiModal('Tell me about this instrument');

// Streaming Multi Turn Chat 예시

async function streamingChat() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { thinkingConfig: { thinkingBudget: 0 } },
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Great to meet you. What would you like to know?' }],
        },
      ],
    });

    const stream = await chat.sendMessageStream({
      message: 'I have 2 dogs in my house.',
    });
    for await (const chunk of stream) {
      console.log(chunk.text);
      console.log('_'.repeat(80));
    }
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

await streamingChat();

// Image 생성 예시
import * as fs from 'node:fs';

async function generateImage(prompt) {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4,
      },
    });

    let idx = 1;
    for (const generatedImage of response.generatedImages) {
      let imgBytes = generatedImage.image.imageBytes;
      const buffer = Buffer.from(imgBytes, 'base64');
      fs.writeFileSync(`image-${idx}.png`, buffer);
      idx++;
    }
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

await generateImage('Robot holding a red skateboard');

// Image 분석 예시
async function processImage(prompt) {
  try {
    const base64ImageFile = fs.readFileSync('path/to/small-sample.jpg', {
      encoding: 'base64',
    });

    const contents = [
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64ImageFile,
        },
      },
      { text: prompt },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    console.log(response.text);
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

await processImage('Caption this image.');

// 문서파일 분석 예시

async function processDocs(prompt) {
  try {
    const file = Buffer.from(fs.readFileSync('content/doc.pdf')).toString(
      'base64'
    );
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: file,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    console.log(response.text);
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

processDocs('Summarize this document');

// 오디오 생성 예시
import wav from 'wav';

async function saveWaveFile(
  filename,
  pcmData,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
) {
  return new Promise((resolve, reject) => {
    const writer = new wav.FileWriter(filename, {
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('finish', resolve);
    writer.on('error', reject);

    writer.write(pcmData);
    writer.end();
  });
}

// 음성 생성 예시

async function getVoiceConfigs(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful assistant for an AI voice generation application. Your task is to analyze a given script and generate a JSON array of speaker configurations. Each configuration should contain a speaker name and a 'voiceConfig' object.

Here are the available voices:
{
  "male": {
    "Puck": "Upbeat",
    "Charon": "Informative",
    "Fenrir": "Excitable",
    "Orus": "Firm",
    "Iapetus": "Clear",
    "Algenib": "Gravelly",
    "Rasalgethi": "Informative",
    "Alnilam": "Firm",
    "Schedar": "Even",
    "Gacrux": "Mature",
    "Zubenelgenubi": "Casual",
    "Sadaltager": "Knowledgeable"
  },
  "female": {
    "Zephyr": "Bright",
    "Kore": "Firm",
    "Leda": "Youthful",
    "Aoede": "Breezy",
    "Callirrhoe": "Easy-going",
    "Autonoe": "Bright",
    "Enceladus": "Breathy",
    "Umbriel": "Easy-going",
    "Algieba": "Smooth",
    "Despina": "Smooth",
    "Erinome": "Clear",
    "Laomedeia": "Upbeat",
    "Achernar": "Soft",
    "Pulcherrima": "Forward",
    "Achird": "Friendly",
    "Vindemiatrix": "Gentle",
    "Sadachbia": "Lively",
    "Sulafat": "Warm"
  }
}

You must follow these rules:
1.  **Analyze the script**: Identify all unique speakers in the provided script.
2.  **Assign voices**: Based on the context, personality, and tone of each speaker's lines, select the most appropriate voice from the provided list. Consider the speaker's name, their role, and the emotional context of the dialogue. For example, a doctor might have a "Firm" or "Informative" voice, while a child might have a "Youthful" or "Upbeat" voice.
3.  **Ensure uniqueness**: Assign a unique voice to each speaker. Do not reuse a voice for multiple speakers.
4.  **Format the output**: Your response must be a single, valid JSON array. Each object in the array should have two keys: 'speaker' (the name of the speaker) and 'voiceConfig'. The 'voiceConfig' object must contain a 'prebuiltVoiceConfig' with a 'voiceName' key, and the value must be one of the voice names from the provided list.

Here is the script to analyze:
${prompt}`,
    });
    return response.text;
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

async function getScript(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI scriptwriter specializing in creating scripts for voice synthesis. Your task is to write a detailed, natural-sounding, and engaging script based on the user's request.

Follow these rules:
1.  **Analyze the user's request**: Carefully read the user's input to understand the theme, tone, purpose, and desired length of the script.
2.  **Add details**: Do not simply rephrase the user's request. Expand upon it by adding realistic dialogue, scene descriptions, and actions to make the script more vivid and complete.
3.  **Include speaker information**: Clearly label each speaker's lines using the format '[Speaker Name]: [Dialogue]'.
4.  **Consider tone and context**: Ensure the dialogue and descriptions match the requested tone (e.g., informative, casual, exciting, formal).
5.  **Use formatting**: Use clear formatting to distinguish between dialogue and scene descriptions.
6.  **Avoid stating your purpose**: Do not mention that you are an AI or explain the process. Simply provide the finished script.

**User's Request:**
${prompt}`,
    });
    return response.text;
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}

async function generateAudioResponse(prompt) {
  try {
    const transcript = await getScript(prompt);
    const voiceConfig = await getVoiceConfigs(transcript);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: transcript,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: voiceConfig,
          },
        },
      },
    });

    const data =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const audioBuffer = Buffer.from(data, 'base64');

    const fileName = 'out.wav';
    await saveWaveFile(fileName, audioBuffer);
  } catch (e) {
    if (error instanceof Error) {
      throw new Error(`생성 요청 실패: ${error.message}`);
    } else {
      throw new Error('생성 요청 실패: 알 수 없는 오류');
    }
  }
}
const examplePrompt =
  'Generate a short transcript around 100 words that reads like it was clipped from a podcast by excited herpetologists. The hosts names are Dr. Anya and Liam.';
await generateAudioResponse(examplePrompt);
