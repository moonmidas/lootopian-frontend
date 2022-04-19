
import React, { useState, useEffect } from 'react'
import useWalletBalance from '../hooks/useWalletBalance';
import useLootopianConfig from '../hooks/useLootopianConfig';
import Select from 'react-select'
import loader from '../assets/loader.gif';
import { MsgExecuteContract, Coin, Coins } from "@terra-money/terra.js"
import { ConnectType, useWallet } from "@terra-money/wallet-provider"
import { useGasPrice } from "../hooks/useGasPrices"
import { Fee } from '@terra-money/terra.js';
import { DENOM, SECTIONS, MINT_PROJECTS, LOOTOPIAN_CONTRACTS } from '../constants';
import { useAddress } from '../hooks/useConnectedAddress';
import useLCDClient from '../hooks/useLCDClient';
import { useNavigate } from "react-router-dom";

function MintItems() {

    const [selectedSection, setSelectedSection] = useState(0);
    const [selectedItem, setSelectedItem] = useState(0);
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const address = useAddress();
    const lcdClient = useLCDClient();
    const [selecting, setSelecting] = useState(false);
    

    // handle onChange event of the dropdown
    const handleSectionChange = e => {        
        setSelectedSection(e.value);
        setSelecting(true);
    }
    const handleItemChange = e => {
        setSelectedItem(e.value);
        navigate("/mint/items/section/" + selectedSection + "/item/" + e.value, { replace: true });
    }

    useEffect(() => {
      async function getMintableItemsPerSection() {
        try {
          let response = await lcdClient.wasm.contractQuery(LOOTOPIAN_CONTRACTS.factory_item, {
            "mintable_items_per_section": {
              "section_id": parseInt(selectedSection)
            }
          });
          console.log(response.items)
          // iterate through response.items array and create an array of objects in the following format:
          // { value: items[i].id, label: item[i].name, price: item[i].price_denom, mint_limit: item[i].mint_limit, amount_minted: item[i].amount_minted, image: item[i].image }
          let new_items = [];
          for (let i = 0; i < response.items.length; i++) {
            if (response.items[i].mint_limit > response.items[i].amount_minted) {
                new_items.push({
                value: response.items[i].id,
                label: response.items[i].name,
                price: response.items[i].denom_price/1000000,
                mint_limit: response.items[i].mint_limit,
                amount_minted: response.items[i].amount_minted,
                image: response.items[i].image
              }); 
            }
            
          }
          setItems(new_items);
          setSelecting(false);
        } catch (e) {
          console.log(e);
        }


      } 
      if (selectedSection !== 0 && selecting) {
        getMintableItemsPerSection();
      }
    }, [lcdClient, selectedSection])

  return (
    <>
      <div className="nes-container is-dark">
          <h2 className="text-center">Items for your Lootopian</h2>
          <p></p>
          <p>Choose a section</p>
          <Select 
              placeholder="Select a section" 
              value={SECTIONS.find(obj => obj.value === selectedSection)} 
              options={SECTIONS} 
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
          />
          <p></p>
          {selectedSection > 0 && items.length > 0 && <><p>Choose an item to mint</p>
          <Select 
              placeholder="Select an item" 
              value={items.find(obj => obj.value === selectedItem)} 
              options={items} 
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
              onChange={handleItemChange}
              formatOptionLabel={item => { 
                  // strip eyes.image of ipfs prefix (ipfs://)
                  
                  return (
                  <div className="item-option">
                    <img src={item.image} height="50px" width="50px" alt="Image" />
                    &nbsp; <span>{item.label}&nbsp;
                    {item.price > 0 
                      ? 
                        <>({item.price} UST) </>
                      :
                        <>(Free!) </>
                      }
                    {item.mint_limit && item.mint_limit > 0 
                      ?
                      <>[{item.mint_limit - item.amount_minted} of {item.mint_limit} available]</>
                      :
                      <>(Unlimited available!)</>
                    }                   
                    </span>
                  </div>
              )}}
          /></>}
      </div>
    </>
  )
}

export default MintItems;