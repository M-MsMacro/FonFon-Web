import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/pro", destination: "/fono", permanent: true },
      { source: "/pro/:path*", destination: "/fono/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
