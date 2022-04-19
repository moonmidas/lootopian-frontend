import React from 'react'
import { Link } from 'react-router-dom'
import ConnectButton from './navbar/ConnectButton'
import { useAddress } from "../hooks/useConnectedAddress"
import { useWallet } from "@terra-money/wallet-provider"



function Navbar() {
    const { disconnect } = useWallet()
    const address = useAddress()
    let shortAddress;
    if (address)
        shortAddress = address.slice(0, 6) + "..." + address.slice(-4)

    return (
        
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">Lootopia!</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                    <Link to="/view" className="nav-link">Gallery</Link>
                    </li>
                    <li className="nav-item">
                    <Link to="/mint" className="nav-link">Mint</Link>
                    </li>
                    <li className="nav-item">
                    <Link to="/equip" className="nav-link">Equip</Link>
                    </li>
                    <li className="nav-item">
                    <Link to="/unequip" className="nav-link">Unequip</Link>
                    </li>
                    
                    {address ? 
                        //<li className="nav-item">
                            <button className="nav-item" onClick={() => disconnect()}>Disconnect {shortAddress}</button>
                        //</li>
                    : 
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Connect Wallet
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <ConnectButton />
                        </ul>
                    </li>} 
                </ul>                   
                </div>
            </div>
        </nav>

    )
}

export default Navbar
