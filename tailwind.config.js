/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#1E1E1E",
          secondary: "#2A2A2A",
          panel: "#1B1B1B",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#C7C7C7",
          muted: "#8A8A8A",
        },
        accent: {
          blue: "#3B82F6",
          orange: "#F97316",
          green: "#10B981",
          red: "#EF4444",
          yellow: "#FACC15",
        },
        method: {
          get: "#22C55E",
          post: "#3B82F6",
          put: "#FACC15",
          delete: "#EF4444",
          patch: "#A855F7",
        },
      },
      // Add scrollbar utilities
      scrollbar: {
        thin: "6px",
      },
    },
  },
  plugins: [
    // Add custom scrollbar plugin
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            height: "6px",
            width: "6px",
          },
        },
        ".scrollbar-thumb-bg-secondary": {
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#2A2A2A",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#3A3A3A",
          },
        },
        ".scrollbar-track-transparent": {
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        },
      });
    },
  ],
};
