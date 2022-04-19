import React from 'react';
import { render } from 'react-dom';
import { QueryClient, QueryClientProvider } from "react-query" 
import { getChainOptions, WalletProvider } from "@terra-money/wallet-provider"
import { BRIDGE } from "./constants"
import App from './App';
import './index.css'


const queryClient = new QueryClient()

getChainOptions().then((chainOptions) => {
  render(
      <WalletProvider {...chainOptions} connectorOpts={{ bridge: BRIDGE }}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WalletProvider>,
    document.getElementById("root")
  )
})
