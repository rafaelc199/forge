export async function extractAudio(video: HTMLVideoElement) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaElementSource(video);
  const analyser = audioContext.createAnalyser();
  
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  // Extrair dados de áudio
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  
  return dataArray;
} 