import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is to allow cross-origin requests from the development environment.
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
    'https://6000-firebase-studio-1764365669384.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev',
    'https://9000-firebase-studio-1764365669384.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev',
  ],
};

export default nextConfig;
