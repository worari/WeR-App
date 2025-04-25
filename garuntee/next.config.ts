import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// next.config.js

module.exports = {
  // ตั้งค่า allowedDevOrigins
  devServer: {
    allowedDevOrigins: ['http://192.168.10.72', 'http://localhost:3000'], // เพิ่ม IP หรือ URL ที่อนุญาต
  },
};
