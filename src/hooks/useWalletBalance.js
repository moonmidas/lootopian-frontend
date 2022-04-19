import { useRefreshingEffect } from './useRefreshingEffect';
import { useState } from 'react';
import useLCDClient from './useLCDClient';
import { useAddress } from "./useConnectedAddress"
import { DENOM, SDOLLAR_CONTRACT } from '../constants.js';


function useWalletBalance() {
    const address = useAddress()
    const [fetchingNewData, setFetchingNewData] = useState();
    const [accountBalance, setAccountBalance] = useState();
    const [accountBalanceFormatted, setAccountBalanceFormatted] = useState();
    const [sdollarsBalance, setSdollarsBalance] = useState();
    const [sdollarsBalanceFormatted, setSdollarsBalanceFormatted] = useState();
    const lcdClient = useLCDClient();
    const denom = DENOM;

    useRefreshingEffect((isRefreshing) => {
        setFetchingNewData(!isRefreshing);
        async function fetchAccountBalance(denom) {
            let response;
            if (address) {
                console.log("Fetching account info...")
                try {
                    response = await lcdClient.bank.balance(address);
                    let coins = response[0].toArray();
                    for (let coin of coins) {
                        if (coin.denom === denom) {
                            let balance = coin.toData().amount/1000000;
                            // balance should have commas every 3 digits and rounded to 2 decimals
                            let balanceFormatted = balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                            setAccountBalanceFormatted(balanceFormatted);
                            setAccountBalance(coin.toData().amount);
                            setFetchingNewData(false);
                        }
                    }
                    response = await lcdClient.wasm.contractQuery(SDOLLAR_CONTRACT, {"balance": {"address":address}});
                    setSdollarsBalance(response.balance);
                    let formatted = response.balance / 100;
                    formatted = formatted.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); 
                    setSdollarsBalanceFormatted(formatted)
                } catch (e) {
                    console.log(e)
                }
            }
        }
        fetchAccountBalance(denom);
    }, 30_000, []);

  return [accountBalance, accountBalanceFormatted, sdollarsBalance, sdollarsBalanceFormatted]
}

export default useWalletBalance