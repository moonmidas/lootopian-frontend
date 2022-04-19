import React from 'react';
import { ConnectType, useWallet } from "@terra-money/wallet-provider"


export default function ConnectWallet({address}) {

    const { connect } = useWallet()

    return (
        <>
            {!address ? 
                <>
                    <p></p>
                    <div className="nes-container is-dark with-title is-centered">
                        <p className="title">Connect your wallet:</p>
                        <p></p>
                            
                        <button className="nes-btn is-primary" href="#" onClick={() => connect(ConnectType.EXTENSION)}>Extension</button>
                        <button className="nes-btn is-primary" href="#" onClick={() => connect(ConnectType.WALLETCONNECT)}>Mobile</button>
                    
                    </div>
                </> 
                : 
                <></>
            }
        </>
    );
}
