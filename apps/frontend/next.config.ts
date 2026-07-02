import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'standalone',
	env: {
    API_BASEURL: process.env.API_BASEURL!,
  },
};

export default nextConfig;
