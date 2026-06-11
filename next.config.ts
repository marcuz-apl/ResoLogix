import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // @ts-ignore
  allowedDevOrigins: ['127.0.0.1', 'localhost', '10.8.8.4', '*'],
  serverExternalPackages: ['pdfkit', 'better-sqlite3'],
  output: 'standalone',
};

export default nextConfig;
