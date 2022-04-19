import { useRefreshingEffect } from './useRefreshingEffect';
import { useState } from 'react';
import useLCDClient from './useLCDClient';
import { MINT_PROJECTS, LOOTOPIAN_CONTRACTS } from '../constants.js';

function useItemInfo(l_section, l_item) {

    const [section, setSection] = useState(l_section);
    const [item, setItem] = useState(l_item);
    const [fetchingNewData, setFetchingNewData] = useState();
    const [itemConfig, setItemConfig] = useState();
    const [name, setName] = useState();
    const [mintLimit, setMintLimit] = useState();
    const [amountMinted, setAmountMinted] = useState();
    const [price, setPrice] = useState();
    const [mintable, setMintable] = useState();
    const [image, setImage] = useState();
    const [author, setAuthor] = useState();
    const [quality, setQuality] = useState();

    const lcdClient = useLCDClient();

    useRefreshingEffect((isRefreshing) => {
        setFetchingNewData(!isRefreshing);
        async function fetchItemConfig() {
            try {
                let response = await lcdClient.wasm.contractQuery(LOOTOPIAN_CONTRACTS.factory_item,{
                    "item_info": {
                        "section_id": parseInt(section),
                        "item_id": parseInt(item)
                    }
                });
                console.log(response)
                setName(response.name);
                setImage(response.ipfs);
                setMintLimit(response.mint_limit);
                setPrice(response.denom_price);
                setMintable(response.mintable);
                setAmountMinted(response.amount_minted);
                setAuthor(response.author);
                setQuality(response.quality);
                setItemConfig(response);
            } catch (e) {
                console.log(e)
            }
            
        }
        fetchItemConfig();
    }, 30_000, []);

  return [name, mintLimit, amountMinted, price, mintable, image, author, quality, itemConfig];
}

export default useItemInfo