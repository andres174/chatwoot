import encoderPath from 'opus-recorder/dist/encoderWorker.min.js?url';

export const convertToOgg = async audioBlob => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let audioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(
      await audioBlob.arrayBuffer()
    );
  } finally {
    await audioContext.close();
  }

  // WhatsApp voice messages require mono Ogg audio encoded with Opus.
  // opus-recorder skips the first 80ms. Pad both ends to preserve the recording.
  const preSkip = Math.ceil(audioBuffer.sampleRate * 0.08);
  const frameSize = Math.ceil(audioBuffer.sampleRate * 0.02);
  const samples = new Float32Array(preSkip + audioBuffer.length + frameSize);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < audioBuffer.length; i += 1) {
      samples[preSkip + i] += channelData[i] / audioBuffer.numberOfChannels;
    }
  }

  return new Promise((resolve, reject) => {
    const encoder = new Worker(encoderPath);
    const pages = [];

    encoder.onerror = error => {
      encoder.terminate();
      reject(new Error(error.message));
    };

    encoder.onmessage = ({ data }) => {
      if (data.message === 'ready') {
        encoder.postMessage({ command: 'getHeaderPages' });
        for (let offset = 0; offset < samples.length; offset += frameSize) {
          const buffer = samples.slice(offset, offset + frameSize);
          encoder.postMessage({ command: 'encode', buffers: [buffer] }, [
            buffer.buffer,
          ]);
        }
        encoder.postMessage({ command: 'done' });
      } else if (data.message === 'page') {
        pages.push(data.page);
      } else if (data.message === 'done') {
        encoder.terminate();
        resolve(new Blob(pages, { type: 'audio/ogg' }));
      }
    };

    encoder.postMessage({
      command: 'init',
      originalSampleRate: audioBuffer.sampleRate,
      encoderSampleRate: 48000,
      encoderApplication: 2048,
      encoderBitRate: 24000,
      numberOfChannels: 1,
    });
  });
};
