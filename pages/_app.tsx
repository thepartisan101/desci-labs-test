import "../styles/globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from "next/app";

import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  [publicProvider()]
);

const projectId = 'b20c95a0e893a28d04719d1fe623ee9b';

const { wallets } = getDefaultWallets({
  appName: 'DeSciLabs Test',
  projectId,
  chains,
});

const testAppInfo = {
  appName: 'DeSciLabs Test',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        appInfo={testAppInfo} 
        chains={chains} 
        theme={{
          lightMode: lightTheme(),
          darkMode: darkTheme({
            accentColor: '#06b6d4',
            borderRadius: 'small',
            overlayBlur: 'small'
          })
        }}
        >
        <Component {...pageProps} />;
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
