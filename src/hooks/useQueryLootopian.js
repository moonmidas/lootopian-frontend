import { useState, useEffect } from 'react';
import useLCDClient from './useLCDClient';
import { MINT_PROJECTS, LOOTOPIAN_CONTRACTS } from '../constants.js';

function useQueryLootopian(lootopian_id) {    

    const lcdClient = useLCDClient();
    const [lootopian, setLootopian] = useState();
    const [fetchingNewData, setFetchingNewData] = useState(false);

    useEffect(() => {
        
        async function fetchLootopian() {
            try {
                let response = await lcdClient.wasm.contractQuery(LOOTOPIAN_CONTRACTS.cw721_lootopian,{
                    "nft_info": {
                        "token_id": lootopian_id.toString()
                }});
                console.log(response)
                setLootopian(response)
            } catch (e) {
                console.log(e)
            }
            
        }
        if (lootopian_id) fetchLootopian();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lootopian_id]);

  return [lootopian];
}

export default useQueryLootopian