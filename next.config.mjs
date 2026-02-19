/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js treats this project directory as the Turbopack root,
  // instead of inferring the workspace root from a different lockfile.
  // In ESM config files we should use process.cwd() instead of __dirname.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
