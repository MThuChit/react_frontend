import { useEffect, useState } from 'react';
import './App.css'
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './middleware/RequireAuth';
import Profile from './components/Profile';
import Login from './components/Login';
import Logout from './components/Logout';
import Users from "./components/Users";
import TestAPI from './components/test_api';
import Items from './components/items';
import { ItemDetail } from './components/itemDetail';

function App() {
    return (
    <Routes>
      <Route path='/test_api' element={<TestAPI />} />
      <Route path='/items' element={<Items />} />
      <Route path='/items/:id' element={<ItemDetail />} />
      <Route path='/Login' element={<Login />} />
      <Route path='/Profile' element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      <Route path='/Logout' element={
        <RequireAuth>
          <Logout />
        </RequireAuth>
      } />
      <Route path='/Users' element={<Users />} />
    </Routes>
  )
}

export default App