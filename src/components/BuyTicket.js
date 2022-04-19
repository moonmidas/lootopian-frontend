import React, { useState, useEffect } from 'react';
import { JACKPOT_CONTRACT } from '../constants';
import { useRefreshingEffect } from '../hooks/useRefreshingEffect';
import loader from '../assets/loader.gif';
import { MsgExecuteContract, Coin, Coins } from "@terra-money/terra.js"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useGasPrice } from "../hooks/useGasPrices"
import { Fee } from '@terra-money/terra.js';


export default function BuyTicket({gameOver, address, lcdClient, nextPrice, nextPriceFormatted, denom, denomFormatted}) {

    const [fetchingNewData, setFetchingNewData] = useState();
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [accountBalance, setAccountBalance] = useState();
    const [accountBalanceFormatted, setAccountBalanceFormatted] = useState();
    const [loaderGif, setLoaderGif] = useState(<></>);
    const gasPrices = useGasPrice(denom);
    const [fees, setFees] = useState();
    const [feesFormatted, setFeesFormatted] = useState();
    const { network, post } = useWallet()
    const [disableBuyButton, setDisableBuyButton] = useState(false);
    const [classBuyButton, setClassBuyButton] = useState('nes-btn is-primary');

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    useEffect(() => {
        if (gasPrices) {
            let fee = new Fee(10000000, gasPrices);
            setFees(fee)
            // gasPrices looks like this: 0.1508uusd, change it to 0.1508
            let gasPricesFormatted = gasPrices.toString().replace('uusd', '');
            setFeesFormatted(gasPricesFormatted)
        }

        
    }, [gasPrices]);
    
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
                } catch (e) {
                    console.log(e)
                }
            }
        }
        fetchAccountBalance(denom);
    }, 3_000, []);


    const buyTicket = async () => {

            const offerCoin = new Coins({ [denom]: nextPrice});
            // rewrite the above const to use the denom variable instead of "uusd"

            //const offerCoins = new Coins(offerCoin);
            const msgs = [
                    new MsgExecuteContract(
                        address,
                        JACKPOT_CONTRACT,
                        {
                            "buy_ticket": { }
                        },
                        offerCoin,
                    )
                ]
            //const gasPrices = "0.200000uusd"

            // gasPrices looks like this: "0.200000uusd"
            // change it so it looks like: gasPrices = { uusd: 0.200000 }
            // split gasPrices into an array of strings, divided by "uusd"
            let gasArray = gasPrices.split("uusd");
            
            let feeObject = {
                [denom] : parseInt(gasArray[0]*1000000)
            }
            let gasObject = {
                [denom]: parseFloat(gasArray[0])
            }

            const tmpFee = new Fee(1000000, feeObject);
            const txOptions = { 
                msgs,
                fee: tmpFee,
                gasPrices: gasObject,
                gasAdjustment: 2 
            }

            if ((accountBalance+gasArray[0]*1000000) < nextPrice) {
                setErrorMsg("You don't have enough UST to buy a ticket!");
                setSuccessMsg("");
                return;
            }

            setDisableBuyButton(true);
            setClassBuyButton('nes-btn is-disabled');
            
            await post(txOptions).then(tx => { 
                setSuccessMsg("");
                setErrorMsg("");
                let retries = 0;
                const getTxInfo = async () => {
                    if (retries < 10) {
                        lcdClient.tx.txInfo(tx.result.txhash).then(txInfo => {
                            // if txInfo.raw_log contains "failed to execute" then set errorMsg
                            if (txInfo.raw_log.includes("Jackpot has ended")) {
                                setSuccessMsg("");
                                return setErrorMsg("Transaction failed... Jackpot has ended!");
                            }
                            console.table(txInfo)
                            let urlForTxResult = "https://finder.extraterrestrial.money/" + network.name + "/tx/" + tx.result.txhash;
                            let txHtml = <><p>Success!</p>
                                <p><a href={urlForTxResult} target="_blank" rel="noreferrer">See the transaction</a></p>
                                </>
                            setLoaderGif(<></>);
                            setDisableBuyButton(false);
                            setClassBuyButton('nes-btn is-primary');
                            return setSuccessMsg(txHtml);
                        }).catch(e => {
                            retries += 1;
                            // Would be cool to have some kind of loader.gif in here
                            setLoaderGif(<img src={loader} alt="loader"/>);
                            setSuccessMsg("Sending transaction...");
                            setTimeout(getTxInfo, 4000);
                        });
                    } else {
                        setSuccessMsg("");
                        setErrorMsg("Transaction failed.");
                        setDisableBuyButton(false);
                        setClassBuyButton('nes-btn is-primary');
                        return;
                    }
                }
                getTxInfo();
            }).catch(e => { 
                if (e.name === "UserDenied") {
                    return setErrorMsg("User denied transaction");                    
                } else if (e.name === "TxFailed") {
                    return setErrorMsg("Transaction failed: " + e.message);
                } else if (e.name === "Timeout") {
                    return setErrorMsg("Transaction timed out");
                } else if (e.name ==="WebExtensionCreateTxFailed") { 
                    return setErrorMsg("Transaction failed: " + e.message);
                } else if (e.name === "CreateTxFailed") {
                    console.table(e);
                    if (e.response) {
                        console.table(e.response)
                    }
                    return setErrorMsg("Transaction failed: " + e.message);
                }
                console.table(e)
                console.log(e.name)
                console.log(e.response.data)
                setErrorMsg(e.response.data.message); 
                setDisableBuyButton(false);
                setClassBuyButton('nes-btn is-primary');
                return e 
            })
         
        
    }

    return (
        <>
        {!gameOver ?
            <div className="col-md-auto nes-container is-dark is-centered">

                <form onSubmit={handleSubmit}>
                    <div className="nes-field">
                    <h4><p className='nes-text'>1 ticket = {nextPriceFormatted} {denomFormatted}</p></h4>
                    <p className='nes-text'>(+ {feesFormatted} {denomFormatted} tx fee)</p>
                    <p className='nes-text'>Wallet Balance: {accountBalanceFormatted} {denomFormatted}</p>
                    <button className={classBuyButton} href="#" disabled={disableBuyButton} onClick={buyTicket}>Buy your ticket to riches!</button>
                    </div>
                </form>
                <p></p>
                {loaderGif}
                {errorMsg ? <p className='nes-text is-error'>{errorMsg}</p> : ""}
                {successMsg ? <div className='nes-text is-error'>{successMsg}</div> : ""}
            </div>
            :
            <></>
        }
        </>
    );
}
