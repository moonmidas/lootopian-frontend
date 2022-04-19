export const BRIDGE = "https://walletconnect.terra.dev/";

// export const SDOLLAR_CONTRACT = "terra182pssdpcahrwt639ankmsjs25pjw3as9tyy46v" // testnet
// export const LOOTOPIAN_CONTRACTS = {
//   router: "terra1rvght2gyjn03fwt4n86g05yve09pvvay0gcz4e", 
//   cw721_lootopian: "terra1swe9059mkzjdv6gxr670akyvknqs8hnyrl9ulk",
//   cw721_item: "terra12fm0z59v4627lwyx8jz28y7trsz52t4j4t8e6k",
//   factory_lootopian: "terra1j5f7nzkl4v4zpfpr3lgn06q0vn9zylgfe74jql",
//   factory_item: "terra1tgh29yc7qrplclnauc4xc2s08sytt20724wvjp"
// }

export const SDOLLAR_CONTRACT = "terra1l0y8yg0s86x299nqw0p6fhh7ngex3r4phtjeuq"
export const LOOTOPIAN_CONTRACTS = {
  router: "terra15mcjmz67f76w27v85qvvaavthz7wp296uxkx8v",
  cw721_lootopian: "terra1tehe2e4ufa9n0xeef4wxvfvhncjyzetlp404wm",
  cw721_item: "terra1gx478xey87dq3dz2sfdt6rfcd0snqpj83ypd3x",
  factory_lootopian: "terra1wg6hxj9u2fa2w7ls2q2xluaacgp9cknufnr06p",
  factory_item: "terra17v93v2c3jv9cmmez5u00h4qkdrdeljg23r7d2l"
}

export const CHUNKS_PER_QUERY = 50;

export const MINT_PROJECTS = [
  { value: 'lootopian', label: 'Lootopian' }, //contract: 'terra1ej7jzhe6l49x4gzxk9y43u98magfjd20zck4e7' },
  { value: 'items', label: 'Lootopian Items' } //contract: 'terra1ej7jzhe6l49x4gzxk9y43u98magfjd20zck4e7', nft_contract: 'terra1ffq8ayzx6f4qm4l8xh49halrvt9zugkqmfzzks' },
]

// Order of sections
// 0. Background
// 1. Body
// 2. Eyes
// 3. Pants
// 4. Shoes
// 5. Shirt
// 6. Waist
// 7. Gloves
// 8. Wrists
// 9. Shoulders
// 10. Neck
// 11. Face Accessories
// 12. Hair
// 13. Hat


export const SECTIONS = [
    { value: 3, label: 'Legs' },
    { value: 4, label: 'Feet' },
    { value: 5, label: 'Torso' },
  //  { value: 6, label: 'Waist' },
  //  { value: 7, label: 'Hands' },
  //  { value: 8, label: 'Wrists' },
  //  { value: 9, label: 'Shoulders' },
    { value: 10, label: 'Neck' },
    { value: 11, label: 'Face Accessories' },
    { value: 13, label: 'Head Wear' }
]
/*
const ITEMS = [
    { value: "11", label: "Face Accessories", mintable: [1,2,3,4]}
]
*/


export const TESTNET = false;
export const DENOM = "uusd";