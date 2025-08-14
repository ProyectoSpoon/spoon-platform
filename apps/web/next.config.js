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
  domains: ['lwwmmufsdtbetgieoefo.supabase.co'], // Tu dominio de Supabase (corregido)
  },

  // Evita errores ENOENT del cache de webpack en Windows durante desarrollo
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
}

module.exports = nextConfig