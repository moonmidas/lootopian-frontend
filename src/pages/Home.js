import React, { useState } from 'react';
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import ConnectWallet from '../components/ConnectWallet';
import Disclaimer from '../components/Disclaimer';
import { Fee } from '@terra-money/terra.js';
import useLCDClient from '../hooks/useLCDClient';
import { MsgExecuteContract, Coin, Coins } from "@terra-money/terra.js"
import { useRefreshingEffect } from '../hooks/useRefreshingEffect';
import { useGasPrice } from "../hooks/useGasPrices"
import { useAddress } from '../hooks/useConnectedAddress';
import HomeMenu from '../components/HomeMenu';


export default function Home() {


    const { connect } = useWallet()
    const address = useAddress()
    const { network, post } = useWallet()
    const lcdClient = useLCDClient()
    
    const [fetchingNewData, setFetchingNewData] = useState();

  return (
    <>
        <ConnectWallet address={address}/>
        <p></p>
        <Disclaimer />
        {address && <HomeMenu/>}
        
    </>);
}
