import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useWallet } from "@terra-money/wallet-provider"
import { Container, Row, Col } from 'react-bootstrap';
import useNftInfo from '../hooks/useNftInfo';
import { LOOTOPIAN_CONTRACTS } from '../constants'
import Select from 'react-select'
import useLoadTokens from '../hooks/useLoadTokens';
import sectionToLabel from '../helpers/sectionToLabel';
import replaceUrlParam from '../helpers/replaceUrlParam';
import {useParams} from 'react-router-dom'
import DressingRoom from './DressingRoom';

function SuccessEquip() {
     let location = useLocation();
    const { state } = location;
    const { network } = useWallet()
    const [successMsg, setSuccessMsg] = useState('');
    //const [image, setImage] = useState();
    const [tokenId, setTokenId] = useState();
    //const [name, setName] = useState();
    const [name, image, attributes, itemConfig] = useNftInfo(LOOTOPIAN_CONTRACTS.cw721_item,state.token_id);
    const [selectedLootopian, setSelectedLootopian] = useState();
   
    useEffect(() => {
        if (state && state.txHash) {
            let urlForTxResult = "https://finder.extraterrestrial.money/" + network.name + "/tx/" + state.txHash;
            let txHtml = <>
                <p>Success!</p>
                <p><a href={urlForTxResult} target="_blank" rel="noreferrer">See the transaction</a></p>
            </>
            setSuccessMsg(txHtml);
        }
        if (state && state.txInfo) {
            setTokenId(state.txInfo[3].value);
            //setName(state.txInfo[5].value);
            //setImage(<img src={state.txInfo[6].value + "&shadow=0"} width="350px" height="350px" className="lootopian-success" alt={state.txInfo[5].value}/>);
        }
        if (state && state.selected_lootopian) {
            setSelectedLootopian(state.selected_lootopian);
        }
    }, [state]);

  return (
    <>
    <div className='nes-container is-dark is-centered'>
        {name && selectedLootopian && <>Equipped {name} successfully in {selectedLootopian.label}!<p></p></>}
        {selectedLootopian && <><img src={selectedLootopian.image} height="300px" width="300px"/><p></p></>}
        
        
            
            {successMsg}
            <p></p>
        </div>
    </>
  )
}

export default SuccessEquip