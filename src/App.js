import React from 'react';
// import { useAddress }  from './hooks/useConnectedAddress';
import Navbar from './components/Navbar';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Mint from './pages/Mint';
import MintLootopian from './components/MintLootopian';
import MintItems from './components/MintItems';
import MintItem from './components/MintItem';
//import { useAddress }  from './hooks/useConnectedAddress';
import './App.css';
import Footer from './components/Footer';
import SuccessLootopianMint from './components/SuccessLootopianMint';
import SuccessItemMint from './components/SuccessItemMint';
import SuccessEquip from './components/SuccessEquip';
import SuccessUnequip from './components/SuccessUnequip';
import Equip from './pages/Equip';
import Unequip from './pages/Unequip';
import View from './pages/View';

function App() {
  //const address = useAddress()
  
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/mint' element={<Mint />} />
        <Route path='/mint/lootopian' element={<MintLootopian />} />
        <Route path='/mint/items' element={<MintItems />} />
        <Route path='/mint/items/section/:section/item/:item' element={<MintItem />} />
        <Route path='/equip' element={<Equip />} />
        <Route path='/unequip' element={<Unequip />} />
        <Route path='/success/lootopian' element={<SuccessLootopianMint />} />
        <Route path='/success/item' element={<SuccessItemMint />} />
        <Route path='/success/equip' element={<SuccessEquip />} />
        <Route path='/success/unequip' element={<SuccessUnequip />} />
        <Route path='/view' element={<View />} />
        <Route path='/about' element={<About />} />

      </Routes>
      <Footer />
    </Router>

  );
}

export default App;
