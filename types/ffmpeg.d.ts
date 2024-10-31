declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(): Promise<void>;
    writeFile(name: string, data: ArrayBuffer | Uint8Array): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    exec(args: string[]): Promise<void>;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File | string): Promise<Uint8Array>;
} 