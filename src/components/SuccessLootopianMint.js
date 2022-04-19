import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { useWallet } from "@terra-money/wallet-provider"
import { Container, Row, Col } from 'react-bootstrap';

function SuccessLootopianMint() {
    let location = useLocation();
    const { state } = location;
    const { network } = useWallet()
    const [successMsg, setSuccessMsg] = useState('');
    const [image, setImage] = useState();
    const [tokenId, setTokenId] = useState();
    const [name, setName] = useState();
    const [strength, setStrength] = useState();
    const [agility, setAgility] = useState();
    const [vitality, setVitality] = useState();
    const [intelligence, setIntelligence] = useState();
    const [luck, setLuck] = useState();
    const [dexterity, setDexterity] = useState();



    useEffect(() => {
        if (state && state.txHash) {
            let urlForTxResult = "https://finder.extraterrestrial.money/" + network.name + "/tx/" + state.txHash;
            let txHtml = <>
                <p>Success!</p>
                <p><a href={urlForTxResult} target="_blank" rel="noreferrer">See the transaction</a></p>
            </>
            setSuccessMsg(txHtml);
        }
        if (state && state.mintType === "denom") {
            console.log(state.txInfo)
            setTokenId(state.txInfo[16].value);
            setName(state.txInfo[4].value);
            setImage(<img src={state.txInfo[5].value + "&shadow=0"} width="350px" height="350px" className="lootopian-success" alt=""/>);
            setStrength(state.txInfo[6].value);
            setAgility(state.txInfo[7].value);
            setVitality(state.txInfo[8].value);
            setIntelligence(state.txInfo[9].value);
            setLuck(state.txInfo[10].value);
            setDexterity(state.txInfo[11].value);
        } else if (state && state.mintType === "token") {
            setTokenId(state.txInfo[21].value);
            setName(state.txInfo[9].value);
            setImage(<img src={state.txInfo[10].value + "&shadow=0"} width="350px" height="350px" className="lootopian-success" alt=""/>);
            setStrength(state.txInfo[11].value);
            setAgility(state.txInfo[12].value);
            setVitality(state.txInfo[13].value);
            setIntelligence(state.txInfo[14].value);
            setLuck(state.txInfo[15].value);
            setDexterity(state.txInfo[16].value);
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
                            <p className="title"><b></b>Lootopian #{tokenId}:</p>
                            {image && <p>{image}</p>}
                            {name && <h3>{name}</h3>}
                        </div>
                        <p></p>
                        </Col>
                        <Col sm={true}>
                            <div className='nes-container is-dark with-title is-centered'>
                                <p className="title">Stats:</p>
                                <div className="">{strength && <p>Strength: {strength}</p>}
                                {agility && <p>Agility: {agility}</p>}
                                {vitality && <p>Vitality: {vitality}</p>}
                                {intelligence && <p>Intelligence: {intelligence}</p>}
                                {luck && <p>Luck: {luck}</p>}
                                {dexterity && <p>Dexterity: {dexterity}</p>}
                                </div>        
                            </div>
                            <p></p>
                            <div className='nes-container is-dark with-title is-centered'>
                                <p className='title'>Tx Details:</p>
                                {successMsg}
                                <p></p>
                            </div>
                            <p></p>
                        </Col>
                    </Row>
                    <Row>
                        
                        <Col sm={true}>
                             
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

export default SuccessLootopianMint