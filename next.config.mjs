/** @type {import('next').NextConfig} */
function allowedDevOriginsFromApiUrl() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return [];
  try {
    const { hostname } = new URL(api);
    if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return [];
    return [hostname];
  } catch {
    return [];
  }
}

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: allowedDevOriginsFromApiUrl(),
}

export default nextConfig
