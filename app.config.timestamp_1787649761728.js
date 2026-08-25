// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
var __dirname = path.resolve();
var app_config_default = defineConfig({
  server: {
    preset: "aws-lambda"
  },
  tsr: {
    appDirectory: "src"
  },
  vite: {
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  }
});
export {
  app_config_default as default
};
