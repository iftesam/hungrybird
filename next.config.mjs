const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/hungrybird' : '';

const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
