import { useWallet } from "@terra-money/wallet-provider"
import axios from "axios"
import { useQuery } from "react-query"


const useGasPrices = () => {
  const { network } = useWallet()

  return useQuery("gasPrices", async () => {
    const { data } = await axios.get("/v1/txs/gas_prices", {
      baseURL: network.lcd.replace("lcd", "fcd"),
    })
    console.log(data)
    return data
  })
}

export const useGasPrice = (denom) => {
  const { data: gasPrices } = useGasPrices()
  return gasPrices ? (gasPrices[denom] * 1.2) + denom : undefined
  //return gasPrices ? gasPrices[denom] : undefined
   
}

export default useGasPrices
