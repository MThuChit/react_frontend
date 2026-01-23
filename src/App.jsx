import {useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import TestAPI from "./components/test_api";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<TestAPI />} />
        </Routes>
    );
}
export default App;
