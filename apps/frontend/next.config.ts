import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'standalone',
	env: {
    GITHUB_REPO_URL: process.env.GITHUB_REPO_URL,
		SENKODIGITAL_REFERRAL: process.env.SENKODIGITAL_REFERRAL,
		OTORING_SLUG: process.env.OTORING_SLUG,
    API_BASEURL: process.env.API_BASEURL
  },
};

export default nextConfig;
