import { env } from '@/lib/env';

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  // let frameName = "BEAMR";
  let frameName = 'Beamr';
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  if (appUrl.includes('localhost')) {
    frameName += ' Local';
    noindex = true;
  } else if (appUrl.includes('ngrok')) {
    frameName += ' NGROK';
    noindex = true;
  } else if (appUrl.includes('https://dev.')) {
    frameName += ' Dev';
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    },
    frame: {
      version: '1',
      name: frameName,
      iconUrl: `${appUrl}/images/beamrLogo.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: `Start Beamr`,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#0F0E0E',
      webhookUrl: `${appUrl}/api/webhook`,
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      // subtitle: "BEAMR", // 30 characters, no emojis or special characters, short description under app name
      subtitle: 'Dynamic micro-subscriptions', // 30 characters, no emojis or special characters, short description under app name
      description:
        'The easiest way to sustainably reward people who make your feed worth scrolling.', // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      // description: "BEAMR", // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: 'social',
      tags: ['mini-app', 'base', 'creator', 'utility', 'streaming'], // up to 5 tags, filtering/search tags
      // tagline: "BEAMR", // 30 characters, marketing tagline should be punchy and descriptive
      tagline: 'Dynamic micro-subscriptions', // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: `${frameName}`, // 30 characters, app name + short tag, Title case, no emojis
      // ogDescription: "BEAMR", // 100 characters, summarize core benefits in 1-2 lines
      ogDescription:
        'The easiest way to sustainably reward people who make your feed worth scrolling.B', // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${appUrl}/images/feed.png`,
      ],
      heroImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: true,
    },
    baseBuilder: {
      ownerAddress: '0x375567484B27648C7CE609425043119b3c0A7285',
    },
  };
}
