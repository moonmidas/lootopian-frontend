import { useState, useEffect } from 'react';
import useLCDClient from './useLCDClient';
import { TESTNET, CHUNKS_PER_QUERY } from '../constants.js';
import { useAddress } from "./useConnectedAddress"
import Bottleneck from 'bottleneck';
import useNftInfo from './useNftInfo';
import axios from "axios";
import _ from 'lodash';

let hiveURL;

if (TESTNET) {
    hiveURL = "https://testnet-hive.terra.dev/graphql";
} else {
    hiveURL = "https://hive.terra.dev/graphql";
}

const limiter = new Bottleneck({
  minTime: 100
});

function useLoadTokens(contract, address) {
    const clientAddress = useAddress();
    const [walletNFTs, setWalletNFTs] = useState([]);
    const lcdClient = useLCDClient();
    const [fetchingTokens, setFetchingTokens] = useState(false);
    
    function generateQuery(id) {
        
        // NOTE: GraphQL does not allow using a number as the name of a query. Therefore instead of id,
        // we use `id_${id}`
        return `
            id_${id}: contractQuery(
                contractAddress: "${contract}", 
                query: {
                    nft_info: {
                        token_id: "${id}"
                    }
                }
            ) 
        `;
    }

    function generateQueries(tokens) {
        let queries = [];
        for (let i = 0; i < tokens.length; i++) {
            queries.push(generateQuery(tokens[i]));
        }
        //console.log(queries.join("\n"))
        return `
            { 
                wasm {
                    ${queries.join("\n")}
                 }
            }
        `;
    }

    // async function that generates the queries and executes them
    /* let response = await limiter.schedule(() => axios.post(hiveURL, {
                    query: generateQueries(tokens),
                })).catch;
                */
    async function fetchNFTs(tokens, retry) {
        let response;
        try {
            response = await limiter.schedule(() => axios.post(hiveURL, {
                    query: generateQueries(tokens),
                }));
                if (response.data.errors) {
                    console.log("Retrying")
                    return fetchNFTs(tokens, retry-1);

                }
                return response;
        } catch (e) {
            if (retry > 0) {
                console.log("Retrying...");
                return fetchNFTs(tokens, retry - 1);
            }
        }
    }

    useEffect(() => {
        console.log("Loading?")
        async function loadTokens() {
            console.log("Loading tokens...");
            setFetchingTokens(true);
            if (!address) address = clientAddress;
            let address2 = address;
            // we need to loop through t
            try {
                let tokens = [];
                let allTokens = [];
                let looping = true;

                while (looping) {
                    let response;
                    
                    if (tokens.length === 0) {
                        response = await lcdClient.wasm.contractQuery(contract,{
                            "tokens": {
                                "owner": address,
                                "limit": 30
                            }
                        });
                    } else {
                        response = await limiter.schedule(() => lcdClient.wasm.contractQuery(contract,{
                            "tokens": {
                                "owner": address2,
                                "limit": 30,
                                "start_after": tokens.pop().toString()
                            }
                        }));
                    }
                    if (response.tokens) {
                        tokens.push(...response.tokens);
                    }
                    console.log(tokens)
                    if (response.tokens.length < 30) {
                        looping = false;
                    }
                }

                // order tokens by id, starting from 0
                tokens.sort((a, b) => a - b);
                console.log(tokens)

/*                let response = await limiter.schedule(() => axios.post(hiveURL, {
                    query: generateQueries(tokens),
                }));
                */
               const tokenChunk = _.chunk(tokens, CHUNKS_PER_QUERY);
                let responses = [];
                for (let i = 0; i < tokenChunk.length; i++) {
                    responses.push(await fetchNFTs(tokenChunk[i], 10));
                }
                // merge responses[0] with responses[1] and so on using lodash
                let mergedResponses = _.merge(...responses);
                //console.log(mergedResponses)
                
                for (const [key, token] of Object.entries(mergedResponses.data.data.wasm)) {
                    const l_id = parseInt(key.slice(3));
                    // if token.token_uri contains a _ then divide it into section and item
                    let token_section_id = 0;
                    let token_item_id = 0;
                    // check that token_uri has a _
                    if (token.token_uri.includes("_")) {
                        let token_uri_split = token.token_uri.split("_");
                        token_section_id = token_uri_split[0];
                        token_item_id = token_uri_split[1];
                    }
                    let new_token = {
                        'label': token.extension.name,
                        'value': l_id,
                        'image': token.extension.image,
                        'section': token_section_id,
                        'item': token_item_id,
                    }
                    allTokens.push(new_token);
                }
                setWalletNFTs(allTokens);
                //console.log(allTokens);
                setFetchingTokens(false);

            } catch (e) {
                console.log(e)
                setFetchingTokens(false);
            }
        }
        if (contract && (address || clientAddress)) {
                loadTokens();
        } else {
            console.log("No contract");
        }
    }, [address, contract]);

  return [walletNFTs, fetchingTokens];
}

export default useLoadTokens