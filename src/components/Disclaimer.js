import React from 'react';

export default function Disclaimer() {
  return <>
            <div className='nes-container is-dark with-title is-centered'>
                <p className="title">Disclaimer:</p>
                <p>This is an experimental proof of concept. This code hasn't been audited. <span className="nes-text is-warning">Use it at your own risk.</span></p> 
            </div>
        </>;
}
