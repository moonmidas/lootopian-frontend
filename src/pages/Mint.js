import React, { useState } from 'react'
import { MINT_PROJECTS } from '../constants'
import Select from 'react-select'
import { useNavigate } from "react-router-dom";



function Mint() {
    // set value for default selection
    const [selectedValue, setSelectedValue] = useState(0);
    const navigate = useNavigate();

    // handle onChange event of the dropdown
    const handleChange = e => {
        
        setSelectedValue(e.value);
        console.log(e.value);
        navigate("/mint/" + e.value, { replace: true });
    }
    return (
        <>
            <div className="nes-container is-dark">
                <h2 className="text-center">Mint Zone</h2>
                <p></p>
                <p>What do you want to mint today?</p>
                <p></p>
                <Select 
                    placeholder="Select Option" 
                    value={MINT_PROJECTS.find(obj => obj.value === selectedValue)} 
                    options={MINT_PROJECTS} 
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
                />

            </div> 
        </>
    )
}

export default Mint