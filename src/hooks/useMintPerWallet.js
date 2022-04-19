import { useRefreshingEffect } from './useRefreshingEffect';
import { useState } from 'react';
import useLCDClient from './useLCDClient';
import { useAddress } from "./useConnectedAddress"
import { LOOTOPIAN_CONTRACTS } from '../constants.js';


function useMintPerWallet() {
    const address = useAddress()
    const [fetchingNewData, setFetchingNewData] = useState();
    const [mintsPerWallet, setMintsPerWallet] = useState();
    const lcdClient = useLCDClient();

    useRefreshingEffect((isRefreshing) => {
        setFetchingNewData(!isRefreshing);
        async function fetchMintsPerWallet() {
            let response;
            if (address) {
                console.log("Fetching account info...")
                try {
                    response = await lcdClient.wasm.contractQuery(LOOTOPIAN_CONTRACTS.factory_lootopian, {"mints_per_wallet": {"address":address}});
                    setMintsPerWallet(response.mints);
                } catch (e) {
                    console.log(e)
                }
            }
        }
        fetchMintsPerWallet();
    }, 30_000, []);

  return [mintsPerWallet];
}

export default useMintPerWallet