import { detectKeyframes } from './video-analysis';

export async function optimizeCut(video: HTMLVideoElement, startTime: number, endTime: number) {
  const keyframes = await detectKeyframes(video);
  
  // Encontrar keyframes mais próximos dos pontos de corte
  const optimizedStart = keyframes.reduce((prev, curr) => 
    Math.abs(curr - startTime) < Math.abs(prev - startTime) ? curr : prev
  );
  
  const optimizedEnd = keyframes.reduce((prev, curr) => 
    Math.abs(curr - endTime) < Math.abs(prev - endTime) ? curr : prev
  );

  return {
    startTime: optimizedStart,
    endTime: optimizedEnd,
    command: `-ss ${optimizedStart} -t ${optimizedEnd - optimizedStart} -c copy`
  };
} 