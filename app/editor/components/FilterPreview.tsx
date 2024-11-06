"use client";

import { useEffect, useRef } from 'react';
import { VideoOperation } from '@/types/video';

interface FilterPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  operation: VideoOperation;
  showComparison?: boolean;
}

export function FilterPreview({ videoRef, operation, showComparison = false }: FilterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar dimensões do canvas para corresponder ao vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Função para aplicar os filtros
    const applyFilters = () => {
      if (!ctx || !video) return;
      
      // Limpar o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenhar o frame atual do vídeo
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Aplicar filtros se for uma operação de filtro
      if (operation.type === 'filter') {
        const filters = operation.filters;
        const filterString = Object.entries(filters)
          .filter(([_, value]) => value !== undefined)
          .map(([filter, value]) => {
            switch (filter) {
              case 'brightness': return `brightness(${value}%)`;
              case 'contrast': return `contrast(${value}%)`;
              case 'saturate': return `saturate(${value}%)`;
              case 'grayscale': return `grayscale(${value}%)`;
              case 'sepia': return `sepia(${value}%)`;
              case 'blur': return `blur(${value/10}px)`;
              default: return '';
            }
          })
          .join(' ');

        canvas.style.filter = filterString;
      }
    };

    // Atualizar o canvas em cada frame
    const animate = () => {
      applyFilters();
      requestAnimationFrame(animate);
    };

    // Iniciar a animação
    const animationId = requestAnimationFrame(animate);

    // Limpar ao desmontar
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [videoRef, operation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{
        opacity: showComparison ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    />
  );
} 