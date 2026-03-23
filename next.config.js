/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable webpack's raw-loader for GLSL shader files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    return config;
  },
};

module.exports = nextConfig;
