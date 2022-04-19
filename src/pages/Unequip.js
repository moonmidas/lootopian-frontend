import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import useItemInfo from '../hooks/useItemInfo'
import { Container, Row, Col } from 'react-bootstrap';
import useWalletBalance from '../hooks/useWalletBalance';
import loader from '../assets/loader.gif';
import { MsgExecuteContract, Coin, Coins } from "@terra-money/terra.js"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
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
import { Link } from 'react-router-dom'


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

    const unequip = async () => {

        let unequip_msg = new MsgExecuteContract(
            address,
            LOOTOPIAN_CONTRACTS.router,
            {
                "unequip_item": {
                    "lootopian_id": parseInt(selectedLootopian.id),
                    "section": parseInt(selectedSection.value)
                }
            }
        );
           
        let gasArray = gasPrices.split("uusd");
          
          let feeObject = {
              "uusd" : parseInt(gasArray[0]*1000000)
          }
          let gasObject = {
              "uusd": parseFloat(gasArray[0])
          }

          if ((parseInt(accountBalance)+gasArray[0]*1000000) < gasArray[0]*1000000) {
              setErrorMsg("You don't have enough UST to unequip this item!");
              setSuccessMsg("");
              return;
      }

          const tmpFee = new Fee(1000000, feeObject);
          const txOptions = { 
              msgs: [unequip_msg],
              gasPrices
          }
          // We disable the button to prevent multiple clicks
          setDisableBuyButton(true);
          setClassBuyButton('nes-btn is-disabled');
          // We show the loader
          setLoaderGif(<img src={loader} alt="Loading..." />);
          await post(txOptions).then(tx => { 
              setSuccessMsg("");
              setErrorMsg("");
              let retries = 0;
              const getTxInfo = async () => {
                  if (retries < 10) {
                      lcdClient.tx.txInfo(tx.result.txhash).then(txInfo => {
                        //console.log(txInfo)                         
                          setLoaderGif(<></>);
                          setDisableBuyButton(false);
                          setClassBuyButton('nes-btn is-primary');
                          
                          navigate('/success/unequip', {state: { token_id: txInfo.logs[0].events[3].attributes[8].value, selected_lootopian: selectedLootopian, txHash: tx.result.txhash, new_image: txInfo.logs[0].events[3].attributes[14].value }});
                          return;
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
            <div className="nes-container is-dark">
                <h2 className="text-center">Remove equipment</h2>
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
                    {itemsToUnequip && itemsToUnequip.length > 0 &&
                                // Create a div container. Inside of it you will be able to select which token you want to load
                        <>
                            
                            <p></p>
                            <Select 
                                placeholder="Select the body section to unequip:" 
                                value={itemsToUnequip.find(obj => obj.value === selectedSection)} 
                                options={itemsToUnequip} 
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
                                onChange={handleSectionChange}
                                formatOptionLabel={section => { 
                    
                                    return (
                                    <div className="lootopian-option text-left" >
                                        <span>{section.label}</span>
                                    </div>
                                )}}
                            />
                        </>
                    }
                    {selectedSection && selectedSection.value &&
						<>
							<p></p>
                            <form>
                                {loaderGif && <div className='nes-field'>{loaderGif}<p></p></div>}
                                {errorMsg && <div className='nes-text is-error'>{errorMsg}<p></p></div>}
                                <button type="button" className={classBuyButton} disable={disableBuyButton ? "true" : "" } onClick={unequip}>
                                Unequip item
                                </button>
                            </form>
                        </>
                    }           
                    </div>
            </div> 
        </>
  )
}

export default Unequip