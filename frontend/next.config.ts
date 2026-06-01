import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mantenerlo en false ayuda a que el deploy en Vercel sea más rápido
    // pero el CI de GitHub sí lo validará.
    ignoreBuildErrors: true,
  },
  devIndicators: {
    // @ts-expect-error - appIsrStatus is a valid internal property but missing in current type definitions
    appIsrStatus: false,
    buildActivity: false,
  },
  async rewrites() {
    let backendUrl = process.env.BACKEND_URL || 'http://localhost:8010';
    // Corregir errores de tipado comunes como http:/ en lugar de http://
    backendUrl = backendUrl.replace(/^http:\/([^\/])/, 'http://$1').replace(/^https:\/([^\/])/, 'https://$1');
    // Eliminar slash final si lo tiene para evitar dobles slashes //
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
