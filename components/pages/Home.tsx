'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import {
  Flex,
  Container,
  Stack,
  Text,
  Button,
  Anchor,
  Loader,
  Paper,
  Select,
  NumberInput,
  TextInput,
} from '@mantine/core';
import { ChartNoAxesColumn, RotateCcw } from 'lucide-react';
import { useUser } from '@/contexts/user-context';
import { usePoints } from '@/contexts/points-context';
import CountdownTimer from '@/components/ui/CountdownTimer';
import PreBeamsCounter from '@/components/ui/PreBeamsCounter';
import WalletSelector from '@/components/wallet/WalletSelector';
import WalletConfirmButton from '@/components/wallet/WalletConfirmButton';
import ShareButton from '@/components/ui/ShareButton';
import { getLaunchDate } from '@/lib/constants';
import { useMiniApp } from '@/contexts/miniapp-context';
import { useAccount } from 'wagmi';

export default function Home() {
  const { isMiniAppReady } = useMiniApp();
  const { user, isLoading, signIn } = useUser();
  const {
    userPoints,
    isLoading: walletLoading,
    confirmWallet,
    refetchPoints,
  } = usePoints();
  const { address } = useAccount();
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isCooldown, setIsCooldown] = useState(false);
  const launchDate = getLaunchDate();
  const currentUser = user;
  const currentPoints = userPoints?.totalPoints || 0;
  const loadingUserOrMiniApp =
    isLoading || walletLoading || !isMiniAppReady || currentUser?.isLoading;

  console.log('isMiniAppReady', isMiniAppReady);
  console.log('currentUser?.isLoading', currentUser?.isLoading);
  console.log('isLoading', isLoading);
  console.log('walletLoading', walletLoading);
  console.log('address', address);
  console.log('currentUser?.data', currentUser?.data);

  const handleRefresh = useCallback(() => {
    if (isCooldown) return;
    if (!currentUser?.data || !userPoints) return;

    console.log('refetching');
    refetchPoints();
    setIsCooldown(true);

    const interval = setInterval(() => {
      clearInterval(interval);
      setIsCooldown(false);
    }, 10000);
  }, [currentUser?.data, isCooldown, refetchPoints, userPoints]);

  if (loadingUserOrMiniApp) {
    return (
      <Container style={{ flex: 1 }} px="md" py="xl">
        <Stack align="center" gap="xl" style={{ height: '100%' }}>
          <CountdownTimer targetDate={launchDate} />
          <Loader color="white" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container px="md" py="xl">
      <Stack align="center" gap="xl" style={{ height: '100%' }}>
        {/* <CountdownTimer targetDate={launchDate} /> */}
        {/* 
        {!currentUser?.data && (
          <Button onClick={signIn} disabled={isLoading} size="xl">
            {isLoading ? <span>Signing in...</span> : 'Sign in'}
          </Button>
        )} */}

        {/* {currentUser?.data && !userPoints?.walletConfirmed && (
          <Stack align="center" gap="md">
            <Text ta="center" size="lg">
              Confirm your preferred wallet to earn your first Beamer token
              stream at launch.
            </Text>
            <WalletSelector
              wallets={currentUser.data.verified_addresses.eth_addresses}
              primaryWallet={
                currentUser.data.verified_addresses.primary.eth_address
              }
              currentWallet={address}
              selectedWallet={selectedWallet}
              onWalletSelect={setSelectedWallet}
              disabled={walletLoading}
            />
            <WalletConfirmButton
              onConfirm={confirmWallet}
              selectedWallet={selectedWallet}
              disabled={!selectedWallet}
              isLoading={walletLoading}
            />
          </Stack>
        )} */}

        {/* {currentUser?.data && userPoints?.walletConfirmed && (
          <Flex direction="column" align="center" gap="md">
            <Flex align="center" gap="md">
              <PreBeamsCounter points={currentPoints} />
            </Flex>

            <Flex
              direction="column"
              align="center"
              gap="lg"
              style={{ width: '100%', maxWidth: '400px' }}
            >
              <Anchor component={Link} href="/leaderboard">
                <Flex direction="row" align="center" gap="xs">
                  <ChartNoAxesColumn size={16} />
                  <Text size="sm"> Leaderboard</Text>
                </Flex>
              </Anchor>
              <Flex direction="row" gap="md" wrap="wrap" justify="center">
                <ShareButton referralCode={currentUser.data.fid} />
              </Flex>
            </Flex>
          </Flex>
        )} */}

        <Cards />

        {/* <Button
          variant="secondary"
          disabled={isCooldown || !currentUser?.data || !userPoints}
          onClick={handleRefresh}
        >
          <RotateCcw size={12} />
        </Button> */}
      </Stack>
    </Container>
  );
}

// const Inputs = () => {
//   return (
//     <Stack gap="xl">
//       <Box>
//         <Text fz="xl" variant="highlight" mb="sm">
//           Select
//         </Text>
//         <Stack gap="md">
//           <Select
//             label="Base Input"
//             placeholder="Pick value"
//             data={['React', 'Angular', 'Vue', 'Svelte']}
//           />
//           <Select
//             label="Error Input"
//             placeholder="Pick value"
//             data={['React', 'Angular', 'Vue', 'Svelte']}
//             error="This is an error"
//           />
//           <Select
//             label="With Description"
//             placeholder="Pick value"
//             data={['React', 'Angular', 'Vue', 'Svelte']}
//             description="This is a description"
//           />
//           <Select
//             label="Filled Input"
//             placeholder="Pick value"
//             data={['React', 'Angular', 'Vue', 'Svelte']}
//             defaultValue={'Vue'}
//           />
//         </Stack>
//       </Box>
//       <Box>
//         <Text fz="xl" variant="highlight" mb="sm">
//           Number Input
//         </Text>
//         <Stack gap="md">
//           <NumberInput
//             label="Base Input"
//             rightSection={'BEAMR'}
//             rightSectionWidth={70}
//           />
//           <NumberInput
//             label="Input With Description"
//             rightSection={'BEAMR'}
//             rightSectionWidth={70}
//             description="This is a description"
//           />
//           <NumberInput
//             label="Input With Error"
//             rightSection={'ETH'}
//             rightSectionWidth={50}
//             error="This is an error"
//           />
//           <NumberInput
//             label="Required Input"
//             rightSection={'ETH'}
//             rightSectionWidth={50}
//             required
//           />
//           <NumberInput
//             label="Filled Input"
//             rightSection={'ETH'}
//             rightSectionWidth={50}
//             value={12345.67}
//           />
//         </Stack>
//       </Box>
//       <Box>
//         <Text fz="xl" variant="highlight" mb="sm">
//           Textarea
//         </Text>
//         <Stack gap="md">
//           <Textarea label="Base Input" placeholder="This is placeholder text" />
//           <Textarea
//             label="Input With Description"
//             placeholder="This is placeholder text"
//             description="This is a description"
//           />
//           <Textarea
//             label="Base Input Error"
//             placeholder="This is placeholder text"
//             error="This is an error message"
//           />
//           <Textarea
//             label="Required Input"
//             placeholder="This is placeholder text"
//             required
//           />
//           <Textarea label="Filled Input" value={'Filled Input'} />
//         </Stack>
//       </Box>
//       <Box>
//         <Text fz="xl" variant="highlight" mb="sm">
//           Text Input
//         </Text>
//         <Stack gap="md">
//           <TextInput
//             label="Base Input"
//             placeholder="This is placeholder text"
//           />
//           <TextInput
//             label="Input With Description"
//             placeholder="This is placeholder text"
//             description="This is a description"
//           />

//           <TextInput
//             label="Base Input Error"
//             placeholder="This is placeholder text"
//             error="This is an error message"
//           />
//           <TextInput
//             label="Required Input"
//             placeholder="This is placeholder text"
//             required
//           />
//           <TextInput label="Filled Input" value={'Filled Input'} />
//         </Stack>
//       </Box>
//     </Stack>
//   );
// };

// const Buttons = () => {
//   return (
//     <Stack>
//       <Box mt="lg">
//         <Text fz={'xl'} variant="highlight" mb="sm">
//           Primary Button
//         </Text>
//         <Stack>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               L
//             </Text>
//             <Button size="lg">Primary</Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               M
//             </Text>
//             <Button>Primary</Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               S
//             </Text>
//             <Button size="sm">Primary</Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               XS
//             </Text>
//             <Button size="xs">Primary</Button>
//           </Box>
//         </Stack>
//       </Box>
//       <Box mt="lg">
//         <Text fz={'xl'} variant="highlight" mb="sm">
//           Secondary Button
//         </Text>
//         <Stack>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               L
//             </Text>
//             <Button variant="secondary" size="lg">
//               Secondary
//             </Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               M
//             </Text>
//             <Button variant="secondary">Secondary</Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               S
//             </Text>
//             <Button variant="secondary" size="sm">
//               Secondary
//             </Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               XS
//             </Text>
//             <Button variant="secondary" size="xs">
//               Secondary
//             </Button>
//           </Box>
//         </Stack>
//       </Box>
//       <Box mt="lg">
//         <Text fz={'xl'} variant="highlight" mb="sm">
//           Disabled Button
//         </Text>
//         <Stack>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               L
//             </Text>
//             <Button size="lg" disabled>
//               Disabled
//             </Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               M
//             </Text>
//             <Button disabled>Disabled</Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               S
//             </Text>
//             <Button disabled size="sm">
//               Disabled
//             </Button>
//           </Box>
//           <Box>
//             <Text fz={30} variant="label" mb="sm">
//               XS
//             </Text>
//             <Button disabled size="xs">
//               Disabled
//             </Button>
//           </Box>
//         </Stack>
//       </Box>
//     </Stack>
//   );
// };

// const OtherComponents = () => {
//   return (
//     <Paper>
//       <Text fz="xl" c="var(--mantine-color-gray-0)" mb="md">
//         Other Components
//       </Text>
//       <Stack>
//         <Box>
//           <Text>Action Icon</Text>
//           <ActionIcon>
//             <User size={24} />
//           </ActionIcon>
//         </Box>
//         <Box>
//           <Text mb="sm">Checkbox</Text>
//           <Checkbox
//             label="Checkbox Label"
//             description="This is a description"
//           />
//         </Box>
//       </Stack>
//     </Paper>
//   );
// };

const Cards = () => {
  return (
    <Paper>
      <Text fz="xl" c="var(--mantine-color-gray-0)" mb="md">
        Card
      </Text>
      <Stack gap="md">
        <Select
          label="Base Input"
          placeholder="Pick value"
          data={['React', 'Angular', 'Vue', 'Svelte']}
        />
        <NumberInput
          label="Required Input"
          rightSection={'ETH'}
          rightSectionWidth={50}
          required
        />
        <TextInput label="Base Input" placeholder="This is placeholder text" />
      </Stack>
    </Paper>
  );
};
