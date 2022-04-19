export default function filterAttributes(lootopian)
{
    /* lootopian looks like:
    {
  "name": "Addaads",
  "mint_date": "1646177106.128954347",
  "mint_block": 8060276,
  "xp": 0,
  "level": 0,
  "class": "Novice",
  "stats": {
    "stat_str": 10,
    "stat_agi": 8,
    "stat_vit": 11,
    "stat_int": 9,
    "stat_luk": 7,
    "stat_dex": 10
  },
  "mint_wallet": "terra1sl0lz9sy2ad08nupmttwqd5myvcqvyqtjqu33a",
  "sections": [
    {
      "section_id": 0,
      "section_name": "bg",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 1,
      "section_name": "body",
      "nft_token_id": 0,
      "db_item_id": 1
    },
    {
      "section_id": 2,
      "section_name": "eyes",
      "nft_token_id": 0,
      "db_item_id": 2
    },
    {
      "section_id": 3,
      "section_name": "pants",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 4,
      "section_name": "shoes",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 5,
      "section_name": "shirt",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 6,
      "section_name": "waist",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 7,
      "section_name": "gloves",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 8,
      "section_name": "wrists",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 9,
      "section_name": "shoulders",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 10,
      "section_name": "neck",
      "nft_token_id": 0,
      "db_item_id": 0
    },
    {
      "section_id": 11,
      "section_name": "face_accessories",
      "nft_token_id": 4,
      "db_item_id": 1
    },
    {
      "section_id": 12,
      "section_name": "hair",
      "nft_token_id": 0,
      "db_item_id": 88
    },
    {
      "section_id": 13,
      "section_name": "hat",
      "nft_token_id": 0,
      "db_item_id": 0
    }
  ]
}
*/
// filter the attributes and only show those where nft_token_id is not 0
// return an array of objects with the following structure:
// {
//      section_id: 11,
//      nft_token_id: 4,
//      db_item_id: 1,
// }

    let filteredAttributes = [];
    lootopian.sections.forEach(section => {
        if (section.nft_token_id !== 0) {
            filteredAttributes.push({
                section_id: section.section_id,
                nft_token_id: section.nft_token_id,
                db_item_id: section.db_item_id,
            });
        }
    }
    );
    return filteredAttributes;

}