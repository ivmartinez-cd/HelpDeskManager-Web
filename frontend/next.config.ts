import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mantenerlo en false ayuda a que el deploy en Vercel sea más rápido
    // pero el CI de GitHub sí lo validará.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignoramos en el build de Vercel para mayor velocidad.
    // El CI de GitHub se encargará de avisarnos si hay errores.
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    // @ts-expect-error - appIsrStatus is a valid internal property but missing in current type definitions
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
