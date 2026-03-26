import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // This works for BOTH GitHub Pages and Vercel automatically
  base: "./", 
});