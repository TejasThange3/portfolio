import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 75 is the default everywhere; the Space page asks for 90 so artwork and covers stay crisp.
  images: { qualities: [75, 90] },
};

export default nextConfig;
