import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 工事現場の視認性カラー
        genba: {
          ink: "#1a1a1a",      // 文字（屋外でも読める濃い黒）
          line: "#d4d4d4",     // 罫線（Excel工程表風）
          grid: "#eaeaea",     // グリッド背景
          today: "#ff5722",    // 今日ライン（工事オレンジ）
          accent: "#1565c0",   // 操作系の青
          warn: "#f9a825",     // 注意（安全イエロー）
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
