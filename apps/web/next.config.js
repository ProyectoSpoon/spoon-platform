/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router es estable en Next.js 14, no necesita experimental
  transpilePackages: ['@spoon/shared'],
  
  // Configuración para el monorepo
  experimental: {
    // Remover appDir - ya no es necesario
  },
  
  // Configuraciones adicionales
  images: {
    domains: ['lwwmmufsdtbetgieofo.supabase.co'], // Tu dominio de Supabase
  },
}

module.exports = nextConfig