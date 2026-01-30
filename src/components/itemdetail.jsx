import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
export function ItemDetail() {
    const { id } = useParams();
    const itemNameRef = useRef();
    const itemCategoryRef = useRef();
    const itemPriceRef = useRef();
    async function loadItem() {
        const uri = `http://localhost:3000/api/item/${id}`;
        console.log("==> uri: ", uri);
        const result = await fetch(uri);
        const data = await result.json();
        console.log("==> data :", data);
        itemNameRef.current.value = data.itemName;
        itemCategoryRef.current.value = data.itemCategory;
        itemPriceRef.current.value = data.itemPrice;
    }
    async function onUpdate() {
        const body = {
            name: itemNameRef.current.value,
            category: itemCategoryRef.current.value,
            price: itemPriceRef.current.value
        }
        const uri = `http://localhost:3000/api/item/${id}`;
        console.log("==> uri: ", uri);
        const result = await fetch(uri, {
            method: "PATCH",
            body: JSON.stringify(body)
        })
        if (result.status == 200) {
            loadItem();
        }
    }
    useEffect(() => {
        loadItem();
    }, []);
    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <th style={{ textAlign: "left" }}>Name</th>
                        <td style={{ textAlign: "left", paddingLeft: "20px" }}><input
                            type="text" ref={itemNameRef} /></td>
                    </tr>
                    <tr>
                        <th style={{ textAlign: "left" }}>Categoery</th>
                        <td style={{ textAlign: "left", paddingLeft: "20px" }}>
                            <select ref={itemCategoryRef}>
                                <option>Stationary</option>
                                <option>Kitchenware</option>
                                <option>Appliance</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th style={{ textAlign: "left" }}>Price</th>
                        <td style={{ textAlign: "left", paddingLeft: "20px" }}><input
                            type="text" ref={itemPriceRef} /></td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <button onClick={() => { onUpdate(); window.location.href = "/items"; }}>update</button>
            <button onClick={() => window.location.href = "/items"}>Back to Items</button>
        </div>
    )
}