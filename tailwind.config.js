/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/*/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
          "colors": {
                "brand": {
                      "primary": "#3f51b5",
                      "secondary": "#ff4081"
                }
          }
    },
  },
  plugins: [],
}
