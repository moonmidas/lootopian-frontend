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
import { MINT_PROJECTS, LOOTOPIAN_CONTRACTS } from '../constants';
import useLCDClient from '../hooks/useLCDClient';
import { useNavigate } from "react-router-dom";
import { useAddress } from '../hooks/useConnectedAddress';
import useLoadTokens from '../hooks/useLoadTokens';
import Select from 'react-select'
import sectionToLabel from '../helpers/sectionToLabel';
import replaceUrlParam from '../helpers/replaceUrlParam';

function DressingRoom({section, item, equip=false, token_id=0}) {
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
	const [originalLootopian, setOriginalLootopian] = useState({});
  const handleLootopianChange = e => {

    let lootopian_id = parseInt(e.value);
    console.log(lootopian_id);
    let section_to_replace = sectionToLabel(parseInt(section));
    let new_lootopian_image = replaceUrlParam(e.image, section_to_replace, item);
    new_lootopian_image = replaceUrlParam(new_lootopian_image, "shadow", 0);
    
    setSelectedLootopian({
      id: lootopian_id,
      image: new_lootopian_image,
      label: e.label
    });

    setOriginalLootopian({
      id: lootopian_id,
      image: e.image,
      label: e.label
    });

        //navigate("/mint/items/section/" + selectedSection + "/item/" + e.value, { replace: true });
  }

  useEffect(() => {
      if (selectedLootopian.id) {
        let section_to_replace = sectionToLabel(parseInt(section));
        let new_lootopian_image = replaceUrlParam(originalLootopian.image, section_to_replace, item);
        new_lootopian_image = replaceUrlParam(new_lootopian_image, "shadow", 0);
        
        setSelectedLootopian({
          id: selectedLootopian.id,
          image: new_lootopian_image,
          label: selectedLootopian.label
        });
      }
  }, [section, item, selectedLootopian.id, selectedLootopian.label, originalLootopian.image]);

  const equipItem = async () => {

    let msgs = [];
    let section_to_unequip = sectionToLabel(parseInt(section));
    if (originalLootopian.image.includes(section_to_unequip) && !originalLootopian.image.includes(section_to_unequip + "=0")) {
      console.log(originalLootopian.image + " contains " + section_to_unequip);
      let unequip_msg =
        new MsgExecuteContract(
          address,
          LOOTOPIAN_CONTRACTS.router,
          {
              "unequip_item": {
                  "lootopian_id": parseInt(selectedLootopian.id),
                  "section": parseInt(section)
              }
          }
        )
        msgs.push(unequip_msg);
    }
    
    // find in string
    // example:
    // let s = "testing this string, i want to find if STRING is inside this"
    // let res = s.includes("STRING")
    // res = true

    // if (s.includes(section_to_unequip)) {
    //   console.log("unequip");
    // } else {
    //   console.log("equip");
    // }

    // find in originalLootopian


    let equipInternalMsg = {
            "equip_item": {
                "lootopian_id": parseInt(selectedLootopian.id)
            }
        }
    let equipInternalMsgBase64 = Buffer.from(JSON.stringify(equipInternalMsg)).toString('base64');

		let equip_msg =
			new MsgExecuteContract(
				address,
				LOOTOPIAN_CONTRACTS.router,
        {
            "equip_item":{
                "lootopian_id":parseInt(selectedLootopian.id),
                "nft_id": token_id.toString()
            }
        }
			)
      msgs.push(equip_msg);
        let gasArray = gasPrices.split("uusd");
          
          let feeObject = {
              "uusd" : parseInt(gasArray[0]*1000000)
          }
          let gasObject = {
              "uusd": parseFloat(gasArray[0])
          }

          if ((parseInt(accountBalance)+gasArray[0]*1000000) < gasArray[0]*1000000) {
              setErrorMsg("You don't have enough UST to equip this item!");
              setSuccessMsg("");
              return;
      }

          const tmpFee = new Fee(1000000, feeObject);
          const txOptions = { 
              msgs,
              gasPrices
              /*fee: tmpFee,
              gasPrices: gasObject,
              gasAdjustment: 2 */
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
                          console.table(txInfo.logs)
                          
                          setLoaderGif(<></>);
                          setDisableBuyButton(false);
                          setClassBuyButton('nes-btn is-primary');
                          
                          navigate('/success/equip', {state: { selected_lootopian: selectedLootopian, token_id: token_id, section: section, item: item, txInfo: txInfo.logs[0].events[3].attributes, txHash: tx.result.txhash }});
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
      <div className='text-center'>
      	{fetchingLootopians && (!lootopians || lootopians.length === 0) && <><p></p><div className="nes-text is-warning">Loading Lootopians...</div></>}
					{lootopians && lootopians.length > 0 &&
					// Create a div container. Inside of it you will be able to select which token you want to load
					<>
            <p></p>
            <p><b></b>See how it would look in your Lootopian:</p>
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
					{selectedLootopian && selectedLootopian.image &&
						<>
							<p></p>
							<p><img src={selectedLootopian.image} height="300px" width="300px"/></p>
              {equip && address &&
                <form>
                  {loaderGif && <div className='nes-field'>{loaderGif}<p></p></div>}
                  {errorMsg && <div className='nes-text is-error'>{errorMsg}<p></p></div>}
                  <button type="button" className={classBuyButton} disable={disableBuyButton ? "true" : "" } onClick={equipItem}>
                  Equip in your Lootopian
                  </button>
                </form>
              } 

						</>
					}
        </div>
    </>
  )
}

export default DressingRoom