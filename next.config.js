/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para FFmpeg.wasm
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },

  // Headers necessários para o FFmpeg e WebGL
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          }
        ],
      },
    ];
  },

  // Configurações de segurança para o FFmpeg funcionar
};

module.exports = nextConfig;
