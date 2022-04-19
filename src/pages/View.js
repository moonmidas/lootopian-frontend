import React, {useEffect, useState} from 'react'
import useWalletBalance from '../hooks/useWalletBalance';
import { Link } from 'react-router-dom'

import loader from '../assets/loader.gif';
import { MsgExecuteContract } from "@terra-money/terra.js"
import { useWallet } from "@terra-money/wallet-provider"
import { useGasPrice } from "../hooks/useGasPrices"
import { Fee } from '@terra-money/terra.js';
import { LOOTOPIAN_CONTRACTS } from '../constants';
import useLCDClient from '../hooks/useLCDClient';
import { useNavigate } from "react-router-dom";
import { useAddress } from '../hooks/useConnectedAddress';
import useLoadTokens from '../hooks/useLoadTokens';
import Select from 'react-select'
import sectionToLabel from '../helpers/sectionToLabel';
import replaceUrlParam from '../helpers/replaceUrlParam';
import useQueryLootopian from '../hooks/useQueryLootopian';
import filterAttributes from '../helpers/filterAttributes';
import listItemsToUnequip from '../helpers/listItemsToUnequip';

function Unequip() {
    const [loaderGif, setLoaderGif] = useState(<></>);
	const [errorMsg, setErrorMsg] = useState('');
	const [disableBuyButton, setDisableBuyButton] = useState(false);
	const [classBuyButton, setClassBuyButton] = useState('nes-btn is-primary');
	const [accountBalance, accountBalanceFormatted] = useWalletBalance(0);
	const lcdClient = useLCDClient();
	const address = useAddress();
  const gasPrices = useGasPrice("uusd");
	const navigate = useNavigate();
	const [successMsg, setSuccessMsg] = useState('');
	const { post } = useWallet();
	const [lootopians, fetchingLootopians] = useLoadTokens(LOOTOPIAN_CONTRACTS.cw721_lootopian);
	const [selectedLootopian, setSelectedLootopian] = useState({});
	const [lootopianInfo] = useQueryLootopian(selectedLootopian.id);
    const [sectionsToUnequip, setSectionsToUnequip] = useState([]);
    const [itemsToUnequip, setItemsToUnequip] = useState([]);
    const [selectedSection, setSelectedSection] = useState({});

    const handleLootopianChange = e => {

        setSelectedLootopian({
        id: e.value,
        image: e.image,
        label: e.label
        });
    }

    const handleSectionChange = e => {
        setSelectedSection(e);
    }

    useEffect(() => {
        if (lootopianInfo) {
            //console.log(lootopianInfo)
            setSectionsToUnequip(filterAttributes(lootopianInfo.extension));
            console.log(filterAttributes(lootopianInfo.extension));
        }
    }, [lootopianInfo]);

    useEffect(() => {
        if (sectionsToUnequip.length > 0) {
            setItemsToUnequip(listItemsToUnequip(sectionsToUnequip));
        }
    }, [sectionsToUnequip]);

           
  return (
    <>
            <div className="nes-container is-dark">
                <h2 className="text-center">Gallery</h2>
                <p></p>
                <div className='text-center'>
                    {!fetchingLootopians && lootopians.length === 0 && <><p>You don't have any lootopians yet!</p><p><Link to="/mint">Go mint a Lootopian first!</Link></p></>}
                    {fetchingLootopians && (!lootopians || lootopians.length === 0) && <><p></p><div className="nes-text is-warning">Loading Lootopians...</div></>}
                    {lootopians && lootopians.length > 0 &&
                                // Create a div container. Inside of it you will be able to select which token you want to load
                        <>
                            <p></p>
                            <p><b></b>Select your lootopian:</p>
                            <p></p>
                            <Select 
                                placeholder="Select a lootopian" 
                                value={lootopians.find(obj => obj.value === selectedLootopian)} 
                                options={lootopians} 
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
                                onChange={handleLootopianChange}
                                formatOptionLabel={lootopian => { 
                    
                                    return (
                                    <div className="lootopian-option text-left" >
                                        <img src={lootopian.image} height="50px" width="50px" alt={lootopian.label} />&nbsp; 
                                        <span>{lootopian.label}</span>
                                    </div>
                                )}}
                            />
                        </>
                    }     
                </div>
            </div> 
            {selectedLootopian.image && 
                <>
                    <div className="nes-container is-dark is-centered">
                        <h2 className="text-center">{selectedLootopian.label}</h2>
                        <p></p>
                        <p><img src={selectedLootopian.image} height="400px" width="400px" alt={selectedLootopian.label} /></p>
                    </div>
                </>
            }

        </>
  )
}

export default Unequip