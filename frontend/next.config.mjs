/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/fondos/rituales_hero.webp",
        destination: "/fondos/rituales_card.webp",
      },
    ];
  },
};

export default nextConfig;
