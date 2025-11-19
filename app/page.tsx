import HomePage from '@/components/pages/Home';
import { env } from '@/lib/env';
import { Metadata } from 'next';

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: 'Start Beamr',
    action: {
      type: 'launch_frame',
      name: 'BEAMR',
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#0F0E0E',
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Beamr',
    openGraph: {
      title: 'Beamr - A dynamic micro-subscription service on Farcaster',
      description: 'The easiest way to sustainably reward people who make your feed worth scrolling.',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <HomePage />;
}
