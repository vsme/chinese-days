import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    outDir: "dist",
    sourcemap: false,
    lib: {
      entry: "./src/index.ts",
      name: "chinaDays",
      formats: ["umd", "es"],
      fileName: (format) => format == 'umd' ? 'index.min.js' : `index.${format}.js`,
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
}));
