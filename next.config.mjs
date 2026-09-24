import path from "node:path"
import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root: there is an unrelated package-lock.json higher up the tree
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    // Images come from the backend (e.g. http://localhost:4000/uploads/...), skip the optimizer
    unoptimized: true,
  },
}

export default nextConfig
