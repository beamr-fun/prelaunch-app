# BEAMR Pre-launch

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

2. Verify environment variables:

```bash
# Required for Frame metadata
NEXT_PUBLIC_URL=

# Required to allow users to add your frame
NEXT_PUBLIC_FARCASTER_HEADER=
NEXT_PUBLIC_FARCASTER_PAYLOAD=
NEXT_PUBLIC_FARCASTER_SIGNATURE=

# Required for user authentication
NEYNAR_API_KEY=
JWT_SECRET=

# Required for webhooks and background notifications
REDIS_URL=
REDIS_TOKEN=

# Required for neynar webhook support
WEBHOOK_SECRET=

# Required for notification blasts
FLOW_CASTER_SECRET=

# Required for supbase client
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# required for referral links
NEXT_PUBLIC_MINIAPP_ID=
```

3. Start the development server:

```bash
npm run dev
```

4. Run a local tunneling server

- [NGROK](https://ngrok.com)
- [Local Tunnel](https://theboroer.github.io/localtunnel-www/)
- cloudflared: `cloudflared tunnel --url http://localhost:3000`

5. Generate your Farcaster Manifest variables

- Follow these [instructions](https://miniapps.farcaster.xyz/docs/guides/publishing)
- Visit [Manifest Tool](https://warpcast.com/~/developers/mini-apps/manifest)
- Paste your tunnel domain

## Scripts

Export user points by fid

```bash
# Export to console
node scripts/export-user-points.js 12345

# Export to file
node scripts/export-user-points.js 12345 > user-12345-points.csv
```

Delete bad notification tokens from redis cache

```bash

node scripts/delete-bad-notification-keys.js

```

Send blast notifications curl

1. create a json file with notification details in the directory you run the curl command

example file blast.json
```json 
{
  "secretKey": "<<SECRETE KEY IN VERCEL ENV>>",
  "notification": {
    "title": "$SUP Rewards Stream Alert",
    "body": "Deposit in the $BEAMR fair launch by 1PM EST for the max $SUP multiplier. Multiple deposits accepted."
  }
}
```

```bash
curl -X POST https://app.beamr.fun/api/blast \
  -H "Content-Type: application/json" \
  -d @blast.json

```