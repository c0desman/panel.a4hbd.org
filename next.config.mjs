import { config } from 'dotenv';

// Step 1: Load the master `.env` to check ACTIVE_ENV
config({ path: ".env" });

// Step 2: Load the target env file (e.g., `.env.local`)
const targetEnv = process.env.ACTIVE_ENV || "local"; // Default: local
const envPath = `.env.${targetEnv}`;

// Load variables into `process.env`
config({ path: envPath });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  
  // New environment variables exposure
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    PORT: process.env.PORT, // Expose PORT if needed
  }
};

export default nextConfig;