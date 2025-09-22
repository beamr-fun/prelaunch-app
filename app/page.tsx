import HomePage from "@/components/pages/home";
import { env } from "@/lib/env";
import { Metadata } from "next";

const appUrl = env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/images/feed.png`,
  button: {
    title: "Launch App",
    action: {
      type: "launch_frame",
      name: "beamr",
      url: appUrl,
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#000000",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "beamr",
    openGraph: {
      title: "beamr",
      description: "beamr",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <HomePage />;
}
