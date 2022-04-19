import { useConnectedWallet } from "@terra-money/wallet-provider"

export const useAddress = () => {
  const connected = useConnectedWallet()
  return connected?.terraAddress
}

const useConnectedAddress = () => {
  const address = useAddress()

  if (!address) throw new Error("Not connected")

  return address
}

export default useConnectedAddress
