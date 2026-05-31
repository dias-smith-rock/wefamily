import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 避免父目录 package-lock.json 被误判为 monorepo 根目录
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
