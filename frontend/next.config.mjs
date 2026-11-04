/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  output: "export",
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
