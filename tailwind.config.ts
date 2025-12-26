import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#667eea",
          dark: "#764ba2",
          light: "#f093fb",
        },
        success: "#34C759",
        warning: "#FF9500",
        error: "#FF3B30",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-success": "linear-gradient(135deg, #34C759 0%, #30B350 100%)",
        "gradient-warning": "linear-gradient(135deg, #FF9500 0%, #FF8000 100%)",
        "gradient-purple": "linear-gradient(135deg, #5856D6 0%, #4B49C9 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
