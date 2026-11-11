import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const frontendDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  agentRules: false,
  output: "export",
  reactCompiler: true,
  turbopack: {
    root: frontendDirectory,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
