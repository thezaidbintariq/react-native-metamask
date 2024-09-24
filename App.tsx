import React, { Suspense, useEffect, useState, useTransition } from 'react'
import { AppRegistry, View, Text, ActivityIndicator, Pressable, Button } from 'react-native'
import '@walletconnect/react-native-compat'
import { WagmiProvider, useReadContracts, useWriteContract, useAccount } from 'wagmi'
import { sepolia, mainnet } from '@wagmi/core/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit, defaultWagmiConfig, AppKit, AppKitButton, NetworkButton } from '@reown/appkit-wagmi-react-native'
import { LPE_TOKEN_ABI, LPE_TOKEN_EXCHANGE_ABI } from './abi'
import { config } from './config'
import { RequestModal } from './RequestModel'
// 1. Get projectId at https://cloud.reown.com
const projectId = '39a38f05adaa9e35db442c0a64abdac2'

const LPE_TOKEN_CONTRACT = {
  address: '0x708638c124204e93Eb7A0EC1FC9e590AAFD305FB',
  abi: LPE_TOKEN_ABI,
} as const

const LPE_TOKEN_EXCHANGE_CONTRACT = {
  address: '0x77287A30363eC91C1719Af966A4E27C9021cF3e9',
  abi: LPE_TOKEN_EXCHANGE_ABI,
} as const

// 2. Create config
const metadata = {
  name: 'AppKit RN',
  description: 'AppKit RN Example',
  url: 'https://reown.com/appkit',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com'
  }
}

const chains = [mainnet, sepolia] as const

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createAppKit({
  projectId,
  wagmiConfig,
  defaultChain: sepolia,
  enableAnalytics: true
})

const queryClient = new QueryClient()

function AppContent() {
  const [isTransitionPending, startTransition] = useTransition()
  const [shouldFetch, setShouldFetch] = useState(false)

  const [requestModalVisible, setRequetsModalVisible] = useState(false);
  const { isConnected, address, status } = useAccount();

  const { data, isPending, isSuccess, isError, writeContract } =
    useWriteContract();



  const { data: contractsData } = useReadContracts({
    contracts: [
      {
        ...LPE_TOKEN_EXCHANGE_CONTRACT,
        functionName: 'totalLiquidity',
      },
      {
        ...LPE_TOKEN_EXCHANGE_CONTRACT,
        functionName: 'MAX_BUY',
      },
      {
        ...LPE_TOKEN_EXCHANGE_CONTRACT,
        functionName: 'MIN_BUY',
      },
      {
        ...LPE_TOKEN_CONTRACT,
        functionName: 'balanceOf',
        args: ["0xA1CF1cD5715415825Da4b2E5D5e6dA720B238312"],
      },
      {
        ...LPE_TOKEN_CONTRACT,
        functionName: 'name',
      },
      {
        ...LPE_TOKEN_CONTRACT,
        functionName: 'symbol',
      },
    ],
  })

  const handleFetch = () => {
    startTransition(() => {
      setShouldFetch(true)
    })
  }

  // Function to safely stringify data, handling BigInt values
  const safeStringify = (data: any): string => {
    return JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  }

  const buyTokens = async () => {
    try {
      writeContract({
        address: LPE_TOKEN_EXCHANGE_CONTRACT.address,
        abi: LPE_TOKEN_EXCHANGE_ABI,
        functionName: 'buyTokens',
        args: [10],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addLiquidity = async () => {
    try {
      writeContract({
        address: LPE_TOKEN_EXCHANGE_CONTRACT.address,
        abi: LPE_TOKEN_EXCHANGE_ABI,
        functionName: 'addLiquidity',
        args: ["0.01"],
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setRequetsModalVisible(true);
    }
  }, [isSuccess, isError]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AppKitButton />
      <NetworkButton />
      <AppKit />
     
      <Text onPress={handleFetch}>Fetch Data</Text>
      {isTransitionPending && <ActivityIndicator />}
      {contractsData && <Text>{safeStringify(contractsData)}</Text>}
      <Pressable onPress={buyTokens} style={{ padding: 10, backgroundColor: 'lightblue', margin: 10 }}>
        <Text>buy 10 tokens</Text>
      </Pressable>
      <Pressable onPress={addLiquidity} style={{ padding: 10, backgroundColor: 'lightblue', margin: 10 }}>
        <Text>add Liquidity</Text>
      </Pressable>
    </View>
  )
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<ActivityIndicator />}>
          <AppContent />
        </Suspense>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Register the app
AppRegistry.registerComponent('main', () => App)

export default App
