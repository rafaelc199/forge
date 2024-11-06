import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { VideoOperation } from '@/types/video';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const operations = JSON.parse(formData.get('operations') as string) as VideoOperation[];

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Criar diretório temporário se não existir
    const tmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true });
    }

    // Gerar nomes únicos para os arquivos
    const timestamp = Date.now();
    inputPath = join(tmpDir, `input-${timestamp}.mp4`);
    outputPath = join(tmpDir, `output-${timestamp}.mp4`);
    
    // Salvar arquivo de entrada
    const bytes = await videoFile.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    try {
      let ffmpegCommand = `ffmpeg -i "${inputPath}"`;
      const filterCommands: string[] = [];
      let trimCommand = '';

      // Processar operações
      operations.forEach(op => {
        switch (op.type) {
          case 'filter':
            Object.entries(op.filters).forEach(([filter, value]) => {
              if (value === undefined || value === 0) return;
              
              switch (filter) {
                case 'brightness':
                  filterCommands.push(`eq=brightness=${(value - 100) / 100}`);
                  break;
                case 'contrast':
                  filterCommands.push(`eq=contrast=${value / 100}`);
                  break;
                case 'saturate':
                  filterCommands.push(`eq=saturation=${value / 100}`);
                  break;
                case 'grayscale':
                  if (value > 0) filterCommands.push('colorchannelmixer=.3:.59:.11');
                  break;
                case 'sepia':
                  if (value > 0) filterCommands.push('colorbalance=rs=.393:gs=.769:bs=.189:rm=.349:gm=.686:bm=.168:rh=.272:gh=.534:bh=.131');
                  break;
                case 'blur':
                  filterCommands.push(`boxblur=${value / 10}`);
                  break;
              }
            });
            break;
          case 'trim':
            trimCommand = `-ss ${op.startTime} -t ${op.endTime - op.startTime}`;
            break;
          case 'resize':
            filterCommands.push(`scale=${op.width}:${op.height}`);
            break;
          case 'rotate':
            filterCommands.push(`rotate=${op.angle}*PI/180:ow=rotw(${op.angle}*PI/180):oh=roth(${op.angle}*PI/180):c=black`);
            break;
          case 'crop':
            filterCommands.push(
              `crop=w=iw*${op.cropWidth/100}:h=ih*${op.cropHeight/100}:x=iw*${op.cropX/100}:y=ih*${op.cropY/100}`
            );
            break;
        }
      });

      // Construir comando final
      if (trimCommand) {
        ffmpegCommand = `ffmpeg ${trimCommand} -i "${inputPath}"`;
      }

      if (filterCommands.length > 0) {
        ffmpegCommand += ` -vf "${filterCommands.join(',')}"`;
      }

      // Adicionar opções de codificação
      ffmpegCommand += ` -c:v libx264 -preset fast -crf 22 -c:a aac`;

      // Adicionar arquivo de saída
      ffmpegCommand += ` -y "${outputPath}"`;

      console.log('Executing FFmpeg command:', ffmpegCommand);

      // Executar FFmpeg
      const { stdout, stderr } = await execAsync(ffmpegCommand);
      console.log('FFmpeg stdout:', stdout);
      console.log('FFmpeg stderr:', stderr);

      // Verificar se o arquivo de saída foi criado
      if (!existsSync(outputPath)) {
        throw new Error('Output file was not created');
      }

      // Ler o arquivo processado
      const processedVideo = await readFile(outputPath);

      // Retornar o vídeo processado
      return new NextResponse(processedVideo, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': processedVideo.length.toString(),
          'Cache-Control': 'no-cache',
          'Content-Disposition': 'inline'
        },
      });
    } catch (error) {
      // Tipagem correta do erro
      const ffmpegError = error as Error;
      console.log('FFmpeg error:', ffmpegError);
      throw new Error(`FFmpeg processing failed: ${ffmpegError.message}`);
    }
  } catch (error) {
    console.log('Video processing failed:', error);
    
    // Limpar arquivos temporários em caso de erro
    try {
      if (inputPath && existsSync(inputPath)) await unlink(inputPath);
      if (outputPath && existsSync(outputPath)) await unlink(outputPath);
    } catch (cleanupError) {
      console.log('Error cleaning up temp files:', cleanupError);
    }

    return NextResponse.json({ 
      error: 'Video processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 