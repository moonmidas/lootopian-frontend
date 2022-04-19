import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "../../hooks/useConnectedAddress"

const ConnectButton = () => {
  const { connect, disconnect } = useWallet()
  const address = useAddress()
  // shorten address so it contains the first 6 and last 4 characters
  let shortAddress;
  if (address)
    shortAddress = address.slice(0, 6) + "..." + address.slice(-4)

  return address ? (    

            <li><button className="text-center dropdown-item" onClick={() => disconnect()}>Disconnect {shortAddress}</button></li>

    
  ) : (
        <>
            <li><button className="dropdown-item" href="#" onClick={() => connect(ConnectType.EXTENSION)}>Extension</button></li>
            <li><button className="dropdown-item" href="#" onClick={() => connect(ConnectType.WALLETCONNECT)}>Mobile</button></li>
        </>
  )
}

export default ConnectButton