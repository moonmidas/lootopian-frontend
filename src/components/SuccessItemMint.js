import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useWallet } from "@terra-money/wallet-provider"
import { Container, Row, Col } from 'react-bootstrap';
import useNftInfo from '../hooks/useNftInfo';
import { LOOTOPIAN_CONTRACT, LOOTOPIAN_CONTRACTS, MINT_PROJECTS } from '../constants'
import useLoadTokens from '../hooks/useLoadTokens';
import sectionToLabel from '../helpers/sectionToLabel';
import replaceUrlParam from '../helpers/replaceUrlParam';
import DressingRoom from './DressingRoom';

function SuccessItemMint() {

    let location = useLocation();
    const { state } = location;
    const { network } = useWallet()
    const [successMsg, setSuccessMsg] = useState('');
    //const [image, setImage] = useState();
    const [tokenId, setTokenId] = useState();
    //const [name, setName] = useState();
    const [name, image, attributes, itemConfig] = useNftInfo(LOOTOPIAN_CONTRACTS.cw721_item,tokenId);
    const [lootopians, fetchingLootopians] = useLoadTokens(LOOTOPIAN_CONTRACTS.cw721_lootopian);
	const [selectedLootopian, setSelectedLootopian] = useState();
	const [selectedLootopianImage, setSelectedLootopianImage] = useState('');

	const handleLootopianChange = e => {

		let lootopian_id = parseInt(e.value);
		console.log(lootopian_id);
        setSelectedLootopian(lootopian_id);
		let section_to_replace = sectionToLabel(parseInt(state.section));
        console.log(e.image);
		let new_lootopian_image = replaceUrlParam(e.image, section_to_replace, state.item);
        console.log(new_lootopian_image);
		new_lootopian_image = replaceUrlParam(new_lootopian_image, "shadow", 0);
		setSelectedLootopianImage(new_lootopian_image);
        //navigate("/mint/items/section/" + selectedSection + "/item/" + e.value, { replace: true });
    }

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
    }, [state]);


  return (
      <>
        {successMsg ?
            <> 
                <Container>
                    <Row>
                        <Col sm={true}>
                            <div className='nes-container is-dark with-title is-centered'>
                                <p className="title"><b></b>Item #{tokenId}:</p>
                                {image && <p>{image}</p>}
                                {name && <h3>{name}</h3>}
                            </div>
                            <p></p>
                            <div className='nes-container is-dark with-title is-centered'>
                                <p className='title'>Tx Details:</p>
                                {successMsg}
                                <p></p>
                            </div>
                        <p></p>
                        </Col>
                        <Col sm={true}>
                            <DressingRoom section={state.section} item={state.item} equip={true} token_id={tokenId}></DressingRoom>
                            <p></p>
                        </Col>
                    </Row>
                    
                    
                </Container>
               
                
            </>
            :
            <></>
        }
   </>
  )

 
}

export default SuccessItemMint