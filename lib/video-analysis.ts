// Função para comparar frames
export function compareFrames(frame1: ImageData, frame2: ImageData): number {
  const data1 = frame1.data;
  const data2 = frame2.data;
  let diff = 0;
  
  for (let i = 0; i < data1.length; i += 4) {
    diff += Math.abs(data1[i] - data2[i]); // R
    diff += Math.abs(data1[i + 1] - data2[i + 1]); // G
    diff += Math.abs(data1[i + 2] - data2[i + 2]); // B
  }
  
  return diff / (frame1.width * frame1.height * 3);
}

// Função para detectar keyframes
export async function detectKeyframes(video: HTMLVideoElement): Promise<number[]> {
  const keyframes: number[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return keyframes;

  canvas.width = 320;
  canvas.height = 180;

  let lastImageData: ImageData | null = null;
  const threshold = 0.15;

  for (let time = 0; time < video.duration; time += 0.5) {
    video.currentTime = time;
    await new Promise(r => video.addEventListener('seeked', r, { once: true }));

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (lastImageData) {
      const diff = compareFrames(imageData, lastImageData);
      if (diff > threshold) {
        keyframes.push(time);
      }
    }

    lastImageData = imageData;
  }

  return keyframes;
} 