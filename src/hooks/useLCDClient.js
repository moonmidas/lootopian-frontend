import { useMemo } from "react"
import { LCDClient, Coins } from "@terra-money/terra.js"
import { useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "./useConnectedAddress"
import { TESTNET } from '../constants'


const useLCDClient = () => {
  let { network } = useWallet()
  const address = useAddress()

  if (TESTNET === true) {
      network = {
          "chainID": "bombay-12",
          "fcd": "https://dry-thrumming-dawn.terra-testnet.quiknode.pro/b9c30e04542b89507411ff08d4082a7dc96b99ff/",
          "lcd": "https://dry-thrumming-dawn.terra-testnet.quiknode.pro/b9c30e04542b89507411ff08d4082a7dc96b99ff/",
          "localterra": false,
          "mantle": "https://bombay-mantle.terra.dev",
          "name": "testnet",
          "walletconnectID": 0,
          "gasPrices": new Coins({uusd: 0.15})
      }
    }
  

  const lcdClient = useMemo(
    () => new LCDClient({ 
      ...network, 
      gasPrices: {uusd: 0.15},
      gasAdjustment: 1.4,
      URL: network.lcd }),
    [network]
  )

  return lcdClient
}

export default useLCDClient
