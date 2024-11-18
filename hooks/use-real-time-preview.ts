import { useEffect, useRef, useState } from 'react';
import { VideoOperation, FilterConfig } from '@/types/video';

// Shader para processamento de vídeo em tempo real
const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform float u_brightness;
  uniform float u_contrast;
  uniform float u_saturation;
  uniform float u_sepia;
  uniform float u_grayscale;
  uniform float u_blur;
  varying vec2 v_texCoord;

  vec4 applyFilters(vec4 color) {
    // Brilho
    color.rgb *= u_brightness;
    
    // Contraste
    color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;
    
    // Saturação
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, u_saturation);
    
    // Sepia
    vec3 sepia = vec3(
      dot(color.rgb, vec3(0.393, 0.769, 0.189)),
      dot(color.rgb, vec3(0.349, 0.686, 0.168)),
      dot(color.rgb, vec3(0.272, 0.534, 0.131))
    );
    color.rgb = mix(color.rgb, sepia, u_sepia);
    
    // Grayscale
    float grayScale = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(color.rgb, vec3(grayScale), u_grayscale);
    
    return color;
  }

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = applyFilters(color);
  }
`;

interface Locations {
  [key: string]: number | WebGLUniformLocation | null;
}

interface PreviewState {
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  locations: Locations;
}

export function useRealTimePreview(
  videoRef: React.RefObject<HTMLVideoElement>,
  operations: VideoOperation[]
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    gl: null,
    program: null,
    locations: {}
  });

  // Inicializar WebGL
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Criar e compilar shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, VERTEX_SHADER);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER);
    gl.compileShader(fragmentShader);

    // Criar e linkar programa
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Configurar geometria
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Configurar atributos e uniforms
    const locations = {
      position: gl.getAttribLocation(program, 'a_position'),
      texCoord: gl.getAttribLocation(program, 'a_texCoord'),
      image: gl.getUniformLocation(program, 'u_image'),
      brightness: gl.getUniformLocation(program, 'u_brightness'),
      contrast: gl.getUniformLocation(program, 'u_contrast'),
      saturation: gl.getUniformLocation(program, 'u_saturation'),
      sepia: gl.getUniformLocation(program, 'u_sepia'),
      grayscale: gl.getUniformLocation(program, 'u_grayscale'),
      blur: gl.getUniformLocation(program, 'u_blur'),
    };

    setPreviewState({
      gl,
      program,
      locations: locations as Locations
    });

    return () => {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  // Renderizar preview
  useEffect(() => {
    if (!videoRef.current || !previewState.gl || !previewState.program) return;

    const { gl, locations } = previewState;
    const video = videoRef.current;

    const render = () => {
      // Atualizar uniforms com valores dos filtros
      const filterOp = operations.find(op => op.type === 'filter') as { filters: FilterConfig['filters'] } | undefined;
      const filters = filterOp?.filters || {};

      gl.uniform1f(locations.brightness as WebGLUniformLocation, (filters.brightness || 100) / 100);
      gl.uniform1f(locations.contrast as WebGLUniformLocation, (filters.contrast || 100) / 100);
      gl.uniform1f(locations.saturation as WebGLUniformLocation, (filters.saturate || 100) / 100);
      gl.uniform1f(locations.sepia as WebGLUniformLocation, (filters.sepia || 0) / 100);
      gl.uniform1f(locations.grayscale as WebGLUniformLocation, (filters.grayscale || 0) / 100);
      gl.uniform1f(locations.blur as WebGLUniformLocation, (filters.blur || 0) / 100);

      // Renderizar frame
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      requestAnimationFrame(render);
    };

    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [videoRef, operations, previewState]);

  return canvasRef;
} 