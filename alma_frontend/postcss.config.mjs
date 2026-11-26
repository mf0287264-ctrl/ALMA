const config = {
  plugins: {
    "@tailwindcss/postcss": {
      optimize: { minify: process.env.NODE_ENV === "production" },
    },
  },
};
export default config;
