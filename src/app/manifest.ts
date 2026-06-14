import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bolão do Klebão',
    short_name: 'Bolão',
    description: 'Faça seus palpites e ganhe pontos!',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
