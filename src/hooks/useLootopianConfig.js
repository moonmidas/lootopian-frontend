import { useRefreshingEffect } from './useRefreshingEffect';
import { useState } from 'react';
import useLCDClient from './useLCDClient';
import { useAddress } from "./useConnectedAddress"
import { MINT_PROJECTS, LOOTOPIAN_CONTRACTS } from '../constants.js';

/*
lootopian_config: {
bodies_allowed: (9) [1, 2, 3, 4, 5, 6, 7, 8, 9]
denom: "uusd"
denom_price: "1000000"
eyes_allowed: (9) [1, 2, 3, 4, 5, 6, 7, 8, 9]
hair_allowed: (222) [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, …]
max_lootopians: null
max_lootopians_per_wallet: null
mintable: true
whitelist: null
}
*/

function useLootopianConfig() {

    const address = useAddress()
    const [fetchingNewData, setFetchingNewData] = useState();
    const [lootopianConfig, setLootopianConfig] = useState();
    const [bodiesAllowed, setBodiesAllowed] = useState();
    const [eyesAllowed, setEyesAllowed] = useState();
    const [hairAllowed, setHairAllowed] = useState();
    const [denomPrice, setDenomPrice] = useState();
    const [mintable, setMintable] = useState();
    const [maxLootopians, setMaxLootopians] = useState();
    const [maxLootopiansPerWallet, setMaxLootopiansPerWallet] = useState();
    const [token, setToken] = useState();
    const [tokenPrice, setTokenPrice] = useState();

    const lcdClient = useLCDClient();

    useRefreshingEffect((isRefreshing) => {
        setFetchingNewData(!isRefreshing);
        async function fetchLootopianConfig() {
            let response;
            if (address) {
                console.log("Fetching lootopian mint config...")
                try {
                    
                    response = await lcdClient.wasm.contractQuery(LOOTOPIAN_CONTRACTS.factory_lootopian,{
                        "config": {}
                    });
                    console.log(response)
                    setBodiesAllowed(response.bodies_allowed);
                    setEyesAllowed(response.eyes_allowed);
                    setHairAllowed(response.hair_allowed);
                    setDenomPrice(response.denom_price);
                    setToken(response.token);
                    setTokenPrice(response.token_price);
                    setMintable(response.mintable);
                    setMaxLootopians(response.max_lootopians);
                    setMaxLootopiansPerWallet(response.max_lootopians_per_wallet);
                    setLootopianConfig(response);
                } catch (e) {
                    console.log(e)
                }
            }
        }
        fetchLootopianConfig();
    }, 20_000, []);

  return [bodiesAllowed, eyesAllowed, hairAllowed, denomPrice, mintable, maxLootopians, maxLootopiansPerWallet, lootopianConfig, token, tokenPrice];
}

export default useLootopianConfig