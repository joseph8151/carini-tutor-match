import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy scale — 신뢰감을 담당하는 텍스트/CTA 컬러 (구 브랜드 블루 대체)
        brand: {
          50: "#EEF1F5",
          100: "#D7DDE7",
          200: "#B4BFD1",
          300: "#8B9AB6",
          400: "#5C6E8C",
          500: "#3A4A66",
          600: "#24324A",
          700: "#1B2537",
          800: "#141B29",
        },
        // Primary Yellow — CTA 포인트, 카드 강조, 아이콘 배경에만 사용
        butter: {
          50: "#FFFDF7",
          100: "#FFF1B8",
          200: "#FCE49B",
          300: "#F9DA7E",
          400: "#F7D06E",
          500: "#F4C84A",
          600: "#E0B32E",
          700: "#C79A1E",
        },
        cream: "#FFFDF7",
        warmwhite: "#FAFAF7",
        charcoal: "#30343B",
        softgray: "#F3F2ED",
        sage: {
          DEFAULT: "#DDE8D5",
          100: "#EEF4EA",
          300: "#DDE8D5",
          500: "#B9CDAC",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-heading)",
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
