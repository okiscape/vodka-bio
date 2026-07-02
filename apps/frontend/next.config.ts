import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: 'standalone',
	env: {
		API_BASEURL: process.env.API_BASEURL,
    GITHUB_REPO_URL: process.env.GITHUB_REPO_URL,
		SENKODIGITAL_REFERRAL: process.env.SENKODIGITAL_REFERRAL,
    OTORING_SLUG: process.env.OTORING_SLUG
  },
};

export default nextConfig;
