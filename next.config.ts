// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nbuxbwnntmqwqgwrkaor.supabase.co",
        port: "",
        pathname: "/storage/v1/**",
      },
      {
        protocol: 'https',
        hostname: 'murukali.com',
        pathname: '/**',
      },
    ],
  },
};
