interface Subtitle {
  start: number;
  end: number;
  text: string;
}

export class SubtitleHandler {
  async loadSubtitles(file: File): Promise<Subtitle[]> {
    const text = await file.text();
    const subtitles: Subtitle[] = [];
    
    // Implementar parser de SRT/VTT
    const lines = text.split('\n');
    // ... lógica de parsing ...

    return subtitles;
  }

  async burnSubtitles(video: File, subtitles: Subtitle[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('video', video);
    formData.append('subtitles', JSON.stringify(subtitles));

    const response = await fetch('/api/video/burn-subtitles', {
      method: 'POST',
      body: formData
    });

    return response.blob();
  }
} 