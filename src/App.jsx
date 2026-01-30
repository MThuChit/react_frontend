import {useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import TestAPI from "./components/test_api";
import Items from "./components/items";
import { ItemDetail } from "./components/itemdetail";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/test_api" element={<TestAPI />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="*" element={<h1>Page not found</h1>} />
            {/* The above line is a catch-all route for any undefined paths */}
        </Routes>
    );
}
export default App;
