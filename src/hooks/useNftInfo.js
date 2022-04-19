import { useState, useEffect } from 'react';
import useLCDClient from './useLCDClient';
import { MINT_PROJECTS } from '../constants.js';

function useNftInfo(address, nft_token_id) {

    const [section, setSection] = useState();
    const [item, setItem] = useState();
    const [fetchingNewData, setFetchingNewData] = useState();
    const [itemConfig, setItemConfig] = useState();
    const [name, setName] = useState();
    const [image, setImage] = useState();
    const [attributes, setAttributes] = useState();
    const [fetchMore, setFetchMore] = useState(true);
    const lcdClient = useLCDClient();

    useEffect(() => {
        async function fetchItemConfig() {
            try {
                let response = await lcdClient.wasm.contractQuery(address,{
                    "nft_info": {
                        "token_id": nft_token_id.toString()
                    }
                });
                console.log(response)
                
                let token_uri = response.token_uri;
                let token_uri_split = token_uri.split("_");
                let section_id = token_uri_split[0];
                let item_id = token_uri_split[1];
                setSection(section_id);
                setItem(item_id);
                setName(response.extension.name);
                setImage(<><img src={response.extension.image} width="350px" height="350px"/></>);
                setAttributes(response.extension.attributes);
                setItemConfig(response);
                setFetchMore(false);
            } catch (e) {
                console.log(e)
            }
            
        }
        if (nft_token_id) {
                fetchItemConfig();
        }
    }, [nft_token_id]);

  return [name, image, attributes, itemConfig];
}

export default useNftInfo