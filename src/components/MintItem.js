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
import DressingRoom from './DressingRoom';

function MintItem() {
	const { section, item } = useParams()
	const [name, mintLimit, amountMinted, price, mintable, image, author, quality, itemConfig] = useItemInfo(section, item)
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
	const [selectedLootopian, setSelectedLootopian] = useState();
	const [selectedLootopianImage, setSelectedLootopianImage] = useState('');

	const handleLootopianChange = e => {

		let lootopian_id = parseInt(e.value);
		console.log(lootopian_id);
        setSelectedLootopian(lootopian_id);
		let section_to_replace = sectionToLabel(parseInt(section));
		let new_lootopian_image = replaceUrlParam(e.image, section_to_replace, item);
		new_lootopian_image = replaceUrlParam(new_lootopian_image, "shadow", 0);
		setSelectedLootopianImage(new_lootopian_image);
        //navigate("/mint/items/section/" + selectedSection + "/item/" + e.value, { replace: true });
    }


  	const mint = async () => {

    	const offerCoin = new Coins({ "uusd": price});
		

		const msgs = [
			new MsgExecuteContract(
				address,
				LOOTOPIAN_CONTRACTS.router,
				{
					"mint_item": {
						"section_id": parseInt(section),
						"item_id": parseInt(item),
					}
				},
				offerCoin,
			)
		]
        let gasArray = gasPrices.split("uusd");
          
          let feeObject = {
              "uusd" : parseInt(gasArray[0]*1000000)
          }
          let gasObject = {
              "uusd": parseFloat(gasArray[0])
          }

          if ((parseInt(accountBalance)+gasArray[0]*1000000) < parseInt(price)) {
              setErrorMsg("You don't have enough UST to buy a ticket!");
              setSuccessMsg("");
              return;
      }

          const tmpFee = new Fee(1000000, feeObject);
          const txOptions = { 
              msgs,
              fee: tmpFee,
              gasPrices: gasObject,
              gasAdjustment: 2 
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
              console.table(tx);
              const getTxInfo = async () => {
                  if (retries < 10) {
                      lcdClient.tx.txInfo(tx.result.txhash).then(txInfo => {
                          console.table(txInfo.logs)
                          
                          setLoaderGif(<></>);
                          setDisableBuyButton(false);
                          setClassBuyButton('nes-btn is-primary');
                          
                          navigate('/success/item', {state: { section: section, item: item, txInfo: txInfo.logs[0].events[6].attributes, txHash: tx.result.txhash }});
                          return;
                      }).catch(e => {
                          console.table(e)
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
		{accountBalance && 
		<div className='nes-container is-dark with-title is-centered'>
			💰 Balance: {accountBalanceFormatted} UST             
			{parseInt(accountBalance) < parseInt(price) && <p><b>Not enough balance to mint item</b></p>}
		</div>
		}
		<Container>
			<Row>
				<Col sm={true}>
					<p></p>       
					<div className='nes-container is-dark with-title is-centered'>
						<p className="title"><b></b>Mint Item:</p>
						{image && <p><img src={image} height="250px" width="250px"/></p>}
						{name && <><h3>{name}</h3> {author && <p>Author: {author}</p>}</>}
						{itemConfig && itemConfig.mint_limit && <p>Minted: {itemConfig.amount_minted} / {itemConfig.mint_limit}</p>}
						{price ? <><p>Mint 💵: {price/1000000} UST</p></> : <p>Mint is free! (+tx fees)</p>}
						{mintable && address && itemConfig && (itemConfig.amount_minted < itemConfig.mint_limit) ?
							<>
							<form>
								{loaderGif && <div className='nes-field'>{loaderGif}<p></p></div>}
								{errorMsg && <div className='nes-text is-error'>{errorMsg}<p></p></div>}
								<button type="button" className={classBuyButton} disable={disableBuyButton ? "true" : "" } onClick={mint}>
								Mint {name} 
								{price > 0 ? <> ({price/1000000} UST)</> : <> (Only tx fees!)</>}
								</button>
							</form>
							</>
                            : <p>Mint limit reached</p>}
					</div>
					<p></p>
				</Col>
				<Col sm={true}>
					<p></p>
					<DressingRoom section={section} item={item}/>
				</Col>
			</Row>
		</Container>
    </>
  )
}

export default MintItem