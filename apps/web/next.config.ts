import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Trace files from the monorepo root so the standalone output
  // includes shared workspace packages (@deepsales/shared, @deepsales/ai).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@deepsales/shared", "@deepsales/ai"],
};

export default nextConfig;
