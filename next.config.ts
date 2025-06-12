import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'cmgtxdccqcjxgcwg.public.blob.vercel-storage.com', // Add your Vercel Blob domain
      'vercel-storage.com',
      'public.blob.vercel-storage.com'
    ],
  },
};

export default nextConfig;