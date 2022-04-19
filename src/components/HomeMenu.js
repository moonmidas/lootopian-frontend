import React from 'react';
import { Link } from 'react-router-dom'

export default function HomeMenu() {
  return <>
            <p></p>
            <div className='nes-container is-dark with-title is-centered'>
                <p className="title">Choose:</p>
                    <p>
                    <Link to="/view">Gallery</Link>
                    </p>
                    <p>
                    <Link to="/mint">Mint</Link>
                    </p>
                    <p>
                    <Link to="/equip">Equip</Link>
                    </p>
                    <p>
                    <Link to="/unequip">Unequip</Link>
                    </p>
            </div>
        </>;
}
