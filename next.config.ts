// next.config.js
module.exports = {
  // Masque le badge Next.js Dev Tools (rond noir "N" en bas de l'écran) —
  // uniquement visible en développement local (`next dev`), jamais en prod,
  // mais retiré pour éviter toute confusion avec une marque tierce.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        // Backend Supabase self-hosted réel (voir docker-compose sur angelserver) —
        // "nbuxbwnntmqwqgwrkaor.supabase.co" ci-dessous est un ancien projet cloud
        // abandonné, jamais celui qui sert vraiment les images produit.
        protocol: "https",
        hostname: "supabase-mipan.mipansarl.com",
        port: "",
        pathname: "/storage/v1/**",
      },
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
