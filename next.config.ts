import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'xhhlwhpqpjpkjvvekqbl.supabase.co' },
      { protocol: 'https', hostname: 'dentallife.com.uy' }
    ],
  },
};

export default nextConfig;
