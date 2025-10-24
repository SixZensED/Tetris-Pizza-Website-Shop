import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1csarkz8obe9u.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.pic.in.th",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
