// MintLootopian: Page where people can mint lootopians
// Flow process:
// 1. Check if minting is enabled
// 2. If minting is enabled, check if user has enough balance in his wallet
// 3. If user has enough balance, show the form to mint lootopians
// 4. If user doesn't have enough balance, show a message saying that he doesn't have enough balance
// Form to mint lootopians:
// Name
// Body color
// Eyes color
// Button to mint lootopians
//https://lootopia.mypinata.cloud/ipfs/

import React, { useState, useEffect } from 'react'
import useWalletBalance from '../hooks/useWalletBalance';
import useLootopianConfig from '../hooks/useLootopianConfig';
import useMintPerWallet from '../hooks/useMintPerWallet';
import Select from 'react-select'
import loader from '../assets/loader.gif';
import { MsgExecuteContract, Coin, Coins } from "@terra-money/terra.js"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useGasPrice } from "../hooks/useGasPrices"
import { Fee } from '@terra-money/terra.js';
import { DENOM, LOOTOPIAN_CONTRACTS, SDOLLAR_CONTRACT } from '../constants';
import { useAddress } from '../hooks/useConnectedAddress';
import useLCDClient from '../hooks/useLCDClient';
import { useNavigate } from "react-router-dom";
import img_ust from '../assets/ust.png';
import img_sdollar from '../assets/sdollar.png';

function MintLootopian() {
    const [selectedBodyValue, setSelectedBodyValue] = useState(0);
    const [selectedEyesValue, setSelectedEyesValue] = useState(0);
    const [accountBalance, accountBalanceFormatted, sdollarsBalance, sdollarsBalanceFormatted] = useWalletBalance(0);
    const [bodiesAllowed, eyesAllowed, hairAllowed, 
        denomPrice, mintable, maxLootopians, 
        maxLootopiansPerWallet, lootopianConfig] = useLootopianConfig(); 
    const [lootopianImageUrl, setLootopianImageUrl] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loaderGif, setLoaderGif] = useState(<></>);
    const gasPrices = useGasPrice("uusd");
    const [fees, setFees] = useState();
    const [feesFormatted, setFeesFormatted] = useState();
    const { network, post } = useWallet()
    const [disableBuyButton, setDisableBuyButton] = useState(true);
    const [classBuyButton, setClassBuyButton] = useState('nes-btn is-disabled');
    const [lootopianName, setLootopianName] = useState('');
    const address = useAddress()
    const lcdClient = useLCDClient()
    const navigate = useNavigate();
    const [mintsPerWallet] = useMintPerWallet();


    const handleChangeBody = e => {
        setSelectedBodyValue(e.value);
        setLootopianImageUrl("https://lootopia-api.spacedollars.money/image?bg=0&shadow=0" + "&body=" + e.value + "&eyes=" + selectedEyesValue);


    }
    const handleChangeEyes = e => {
        setSelectedEyesValue(e.value);
        setLootopianImageUrl("https://lootopia-api.spacedollars.money/image?bg=0&shadow=0" + "&body=" + selectedBodyValue + "&eyes=" + e.value);
    }
    const handleSubmit = (e) => {
        e.preventDefault()
    }

    useEffect(() => {
        if (selectedBodyValue !== 0 && lootopianName.length >= lootopianConfig.name_min_length && accountBalance > 0 && lootopianName.length < lootopianConfig.name_max_length) {
            setDisableBuyButton(false);
            setClassBuyButton('nes-btn is-primary');
        }
    }, [selectedBodyValue, selectedEyesValue, lootopianName, accountBalance]);
        
    const mint = async () => {

        if (lootopianName.length < lootopianConfig.name_min_length || lootopianName.length > lootopianConfig.name_max_length) {
            setErrorMsg("Lootopian name must be between " + lootopianConfig.name_min_length + " and " + lootopianConfig.name_max_length + " characters long");
            return;
        }

        let msgs, gasArray, feeObject, gasObject, tmpFee, txOptions, priceToMint;


        
        if (lootopianConfig.denom !== null) {
            gasArray = gasPrices.split("uusd");
            
            feeObject = {
                "uusd" : parseInt(gasArray[0]*1000000)
            }
            gasObject = {
                "uusd": parseFloat(gasArray[0])
            }
            const offerCoin = new Coins({ "uusd": denomPrice});
                // rewrite the above const to use the denom variable instead of "uusd"

                //const offerCoins = new Coins(offerCoin);
            msgs = [
                new MsgExecuteContract(
                    address,
                    LOOTOPIAN_CONTRACTS.router,
                    {
                        "mint_lootopian": {
                            "name": lootopianName,
                            "body": parseInt(selectedBodyValue),
                        }
                    },
                    offerCoin,
                )
            ]
            //const gasPrices = "0.200000uusd"

            // gasPrices looks like this: "0.200000uusd"
            // change it so it looks like: gasPrices = { uusd: 0.200000 }
            // split gasPrices into an array of strings, divided by "uusd"

            priceToMint = denomPrice+(gasArray[0]*1000000);
            if ((priceToMint > 0) && ((accountBalance+gasArray[0]*1000000) < priceToMint)) {
                setErrorMsg("You don't have enough UST to mint");
                setSuccessMsg("");
                return;
            }
            tmpFee = new Fee(1000000, feeObject);
            txOptions = { 
                msgs,
                fee: tmpFee,
                gasPrices: gasObject,
                gasAdjustment: 2 
            }
                
        } else if (lootopianConfig.token !== null) {

             let mintInternalMsg = {
                "mint_lootopian": {
                    "name": lootopianName,
                    "body": parseInt(selectedBodyValue),
                }
            }
            let mintInternalMsgBase64 = Buffer.from(JSON.stringify(mintInternalMsg)).toString('base64');


            msgs = [
                new MsgExecuteContract(
                    address,
                    lootopianConfig.token,
                    {
                        "send":{
                            "amount":lootopianConfig.token_price,
                            "contract":LOOTOPIAN_CONTRACTS.router,
                            "msg": mintInternalMsgBase64
                        }
                    }
                )
            ]
            txOptions = { 
                msgs,
                gasPrices 
            }

            //priceToMint = gasArray[0]*1000000;

        } else {
                // rewrite the above const to use the denom variable instead of "uusd"
            gasArray = gasPrices.split("uusd");
            
            feeObject = {
                "uusd" : parseInt(gasArray[0]*1000000)
            }
            gasObject = {
                "uusd": parseFloat(gasArray[0])
            }
                //const offerCoins = new Coins(offerCoin);
            msgs = [
                new MsgExecuteContract(
                    address,
                    LOOTOPIAN_CONTRACTS.router,
                    {
                        "mint_lootopian": {
                            "name": lootopianName,
                            "body": parseInt(selectedBodyValue),
                        }
                    },
                )
            ]
            //const gasPrices = "0.200000uusd"

            // gasPrices looks like this: "0.200000uusd"
            // change it so it looks like: gasPrices = { uusd: 0.200000 }
            // split gasPrices into an array of strings, divided by "uusd"

            priceToMint = (gasArray[0]*1000000);
            if ((priceToMint > 0) && ((accountBalance+gasArray[0]*1000000) < priceToMint)) {
                setErrorMsg("You don't have enough UST to mint");
                setSuccessMsg("");
                return;
            }
            tmpFee = new Fee(1000000, feeObject);
            txOptions = { 
                msgs,
                fee: tmpFee,
                gasPrices: gasObject,
                gasAdjustment: 2 
            }
        }



        // We disable the button to prevent multiple clicks
        setDisableBuyButton(true);
        setClassBuyButton('nes-btn is-disabled');
        // We show the loader
        setLoaderGif(<img src={loader} alt="Loading..." />);
        await post(txOptions).then(tx => { 
            console.log(tx);
            setSuccessMsg("");
            setErrorMsg("");
            let retries = 0;
            const getTxInfo = async () => {
                if (retries < 10) {
                    lcdClient.tx.txInfo(tx.result.txhash).then(txInfo => {
                        console.table(txInfo)
                        
                        setLoaderGif(<></>);
                        setDisableBuyButton(false);
                        setClassBuyButton('nes-btn is-primary');
                        let txInfoToSend;
                        let mint_type = "denom"
                        if (lootopianConfig.token) {
                            txInfoToSend = txInfo.logs[0].events[3].attributes;
                            mint_type = "token"
                        } else {
                            txInfoToSend = txInfo.logs[0].events[6].attributes;
                        }
                        return navigate('/success/lootopian', {state: { txInfo: txInfoToSend, txHash: tx.result.txhash, mintType: mint_type }});
                    }).catch(e => {
                        retries += 1;
                        // Would be cool to have some kind of loader.gif in here
                        setLoaderGif(<img src={loader} alt="loader"/>);
                        setSuccessMsg("Sending transaction...");
                        setTimeout(getTxInfo, 4000);
                    });
                } else {
                    setSuccessMsg("");
                    setLoaderGif(<></>);
                    setErrorMsg("Transaction failed.");
                    setDisableBuyButton(false);
                    setClassBuyButton('nes-btn is-primary');
                    return;
                }
            }
            getTxInfo();
        }).catch(e => { 
            if (e.name === "UserDenied") {
                setErrorMsg("User denied transaction");                    
            } else if (e.name === "TxFailed") {
                setErrorMsg("Transaction failed: " + e.message);
            } else if (e.name === "Timeout") {
                setErrorMsg("Transaction timed out");
            } else if (e.name ==="WebExtensionCreateTxFailed") { 
                setErrorMsg("Transaction failed: " + e.message);
            } else if (e.name === "CreateTxFailed") {
                console.table(e);
                if (e.response) {
                    console.table(e.response)
                }
                setErrorMsg("Transaction failed: " + e.message);
            } else if (e.response && e.response.data && e.response.data.message) {
                setErrorMsg(e.response.data.message);
            }  else {
                setErrorMsg("Unknown error");
            }
            console.table(e);
            setLoaderGif(<></>);
            setDisableBuyButton(false);
            setClassBuyButton('nes-btn is-primary');
            return e 
        })
         
        
    }

    return (
        <>
            {lootopianConfig && lootopianConfig.mintable && accountBalance > 0 ?
            <>
                <div className='nes-container is-dark with-title is-centered'>
                    <p>Balances: </p>
                    <p><img src={img_ust} alt="UST" width="16px" height="16px" /> {accountBalanceFormatted} <b>UST</b></p><p><img src={img_sdollar} width="16px" height="16px"  alt="SDOLLAR" /> {sdollarsBalanceFormatted} <b>SDOLLAR</b></p>            
                </div>
                <p></p>
                <div className='nes-container is-dark with-title is-centered'>
                    {/*Create a Form with name input, body color (select), eyes color (select) and a button to mint lootopians*/}
                    <form>
                        <div className='nes-field'>
                            <label>Write your Lootopian's name:</label>
                            <input type="text" className='nes-input' name="name" maxLength="40" value={lootopianName} onInput={e => setLootopianName(e.target.value)}/>
                        </div>
                        <p></p>
                        <div className='nes-field'>
                            <label>Choose your Lootopian's body:</label>
                            <Select 
                                placeholder="Select Body Type"
                                value={bodiesAllowed.find(obj => obj.value === selectedBodyValue)}
                                options={bodiesAllowed}
                                onChange={handleChangeBody}
                                formatOptionLabel={bodyAllowed => { let image="https://lootopia.mypinata.cloud/ipfs/" + bodyAllowed.image.substring(7); return (
                                    <div className="body-option">
                                    <img src={image} height="50px" width="50px" alt="Lootopian Body" />
                                    <span>{bodyAllowed.label}</span>
                                    </div>
                                )}}
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 0,
                                    colors: {
                                        ...theme.colors,
                                        primary: 'black',
                                        primary25: 'black',
                                        primary50: 'black',
                                        neutral0: 'darkslateblue',
                                        neutral50: 'white',
                                        neutral80: 'white'
                                    },
                                })}
                            />
                        </div>
                        <p></p>
                        {/* <div className='nes-field'>
                        <label>Choose your Lootopian's eyes color:</label>
                            <Select 
                                placeholder="Select Eyes Color"
                                value={eyesAllowed.find(obj => obj.value === selectedEyesValue)}
                                options={eyesAllowed}
                                onChange={handleChangeEyes}
                                formatOptionLabel={eyes => { 
                                    // strip eyes.image of ipfs prefix (ipfs://)
                                    let image="https://lootopia.mypinata.cloud/ipfs/" + eyes.image.substring(7);
                                    return (
                                    <div className="eyes-option">
                                    <img src={image} height="50px" width="50px" alt="Image" />
                                    <span>{eyes.label}</span>
                                    </div>
                                )}}
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 0,
                                    colors: {
                                        ...theme.colors,
                                        primary: 'black',
                                        primary25: 'black',
                                        primary50: 'black',
                                        neutral0: 'darkslateblue',
                                        neutral50: 'white',
                                        neutral80: 'white'
                                    },
                                })}
                            />
                        </div> */}
                        <p></p>
                        {lootopianImageUrl &&
                        <>
                            <div className='nes-field'>
                                <label>Lootopian's preview (without random hair and random eyes):</label>
                                <img src={lootopianImageUrl} alt="Lootopian" height="300px" width="300px" className="lootopian-success"/>
                            </div>
                            <p></p>
                        </>
                        }
                        {loaderGif && <div className='nes-field'>{loaderGif}<p></p></div>}
                        {errorMsg && <div className='nes-text is-error'>{errorMsg}<p></p></div>}
                        {maxLootopians && <p>Minted: {lootopianConfig.lootopians_minted} / {maxLootopians}</p>}
                        {maxLootopiansPerWallet ? <p>Mints per wallet: {mintsPerWallet} / {maxLootopiansPerWallet}</p> : <>Mints per wallet: {mintsPerWallet}/∞</>}
                        <p>Mint:
                            {lootopianConfig && lootopianConfig.token && lootopianConfig.token === SDOLLAR_CONTRACT && <> <img src={img_sdollar} width="16px" height="16px"  alt="SDOLLAR" /> {lootopianConfig.token_price/100} <b>SDOLLAR</b> <p><a href="https://terrafloki.io/app/trade">[Buy SDOLLAR in TerraFloki Dex]</a></p></>}
                            {lootopianConfig && lootopianConfig.denom && <> <img src={img_ust} width="16px" height="16px"  alt="UST" /> {lootopianConfig.denom_price/1000000} UST</>}
                        </p>

                        <button type="button" className={classBuyButton} disable={disableBuyButton ? "true" : "" } onClick={mint}>Mint Lootopian</button>
                    </form>
                </div>
            </>
            :
            <><div className='nes-container is-dark with-title is-centered'>
                    Please connect your wallet first and refresh the page.    
            </div></>
            }
        </>    
    )
}

export default MintLootopian