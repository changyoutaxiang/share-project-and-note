import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // 优化构建配置
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          // React 相关
          "react-vendor": ["react", "react-dom", "react-hook-form"],
          // UI 组件库
          "ui-vendor": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          // 工具库
          utils: ["date-fns", "clsx", "zod", "framer-motion"],
          // 图表库
          charts: ["recharts"],
        },
        // 为每个chunk生成独立的CSS文件
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split(".").pop();
          if (extType === "css") {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },
    // 构建性能优化
    reportCompressedSize: false, // 禁用 gzip 压缩大小报告以提升构建速度
    chunkSizeWarningLimit: 1000, // chunk 大小警告限制 (kb)
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
