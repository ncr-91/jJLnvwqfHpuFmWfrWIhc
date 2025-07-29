// tailwind.config.ts
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["InterVariable", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],

  safelist: [
    "row-span-1",
    "row-span-2",
    "row-span-3",
    "row-span-4",
    "row-span-5",
    "row-span-6",
  ],
};
