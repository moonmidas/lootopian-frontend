import React, { useState } from 'react'
import { LOOTOPIAN_CONTRACTS } from '../constants'
import Select from 'react-select'
import { useNavigate } from "react-router-dom";
import useLoadTokens from '../hooks/useLoadTokens'
import { useAddress } from "../hooks/useConnectedAddress"
import DressingRoom from '../components/DressingRoom';
import { Link } from 'react-router-dom'


function Equip() {
    // set value for default selection
    const [selectedItem, setSelectedItem] = useState();
    const navigate = useNavigate();
    const address = useAddress();
    const [items, fetchingTokens] = useLoadTokens(LOOTOPIAN_CONTRACTS.cw721_item, address);
    // handle onChange event of the dropdown
    const handleChange = e => {
        
        setSelectedItem(e);
        console.log(e.value);
        //navigate("/mint/" + e.value, { replace: true });
    }
    
    return (
        <>
            <div className="nes-container is-dark">
                <h2 className="text-center">Equip your Lootopian</h2>
                <p></p>
                
                <p></p>
                {fetchingTokens ? <p className="text-center">Loading items...</p> : <></>}
                {!fetchingTokens && items.length === 0 ? <><p className="text-center">No items found.</p><p className="text-center"><Link to="/mint">Go mint an item first!</Link></p></> : <></>}
                {items && items.length > 0 && <><p className="text-center">Select the item you want to equip:</p><p></p><Select 
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
                    onChange={handleChange}
                    formatOptionLabel={item => { 
        
                        return (
                        <div className="item-option text-left" >
                            <img src={item.image} height="50px" width="50px" alt={item.label} />&nbsp; 
                            <span>{item.label}</span>
                        </div>
                    )}}
                /></>
                }
                {selectedItem && selectedItem.value > 0 && <DressingRoom section={selectedItem.section} item={selectedItem.item} equip="true" token_id={selectedItem.value}/>}
            </div> 
        </>
    )
}

export default Equip