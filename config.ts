import { createConfig } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'
import { http } from 'viem'
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})