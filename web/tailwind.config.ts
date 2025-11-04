import type { Config } from "tailwindcss";

export default {
  // Tailwind v4 tự động detect content từ src/
  theme: {
    extend: {
      colors: {
        primary: "#ff6b35",
        secondary: "#004e89",
      },
      screens: {
        '850': '850px',
      },
    },
  },
} satisfies Config;