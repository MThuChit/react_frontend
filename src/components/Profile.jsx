import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";
import { useEffect, useState, useRef } from "react";
export default function Profile() {
    const { user, logout } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({});
    const [hasImage, setHasImage] = useState(false);
    const fileInputRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL;
    console.log(`URL => ${API_URL}`);
    async function onUpdateImage() {
        const file = fileInputRef.current?.files[0];
        if (!file) {
            alert("Please select a file.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await fetch(`${API_URL}/api/user/profile/image`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            if (response.ok) {
                alert("Image updated successfully.");
                fetchProfile();
            } else {
                alert("Failed to update image.");
            }
        } catch (err) {
            alert("Error uploading image.");
        }
    }
    async function fetchProfile() {
        const result = await fetch(`${API_URL}/api/user/profile`, {
            credentials: "include"
        });
        if (result.status == 401) {
            logout();
        }
        else {
            const data = await result.json();
            if (data.profileImage != null) {
                console.log("has image...");
                setHasImage(true);
            }
            console.log("data: ", data);
            setIsLoading(false);
            setData(data);
        }
    }
    useEffect(() => {
        fetchProfile();
    }, []);
    return (
        <div>
            <h3>Profile...</h3>
            {
                isLoading ?
                    <div>Loading...</div> :
                    <div>
                        ID: {data._id} <br />
                        Email: {data.email} <br />
                        First Name: {data.firstname} <br />
                        Last Name: {data.lastname} <br />
                        Image: {hasImage && <img src={`${API_URL}${data.profileImage}`}
                            width={150} height={150} />} <input type="file" id="profileImage"
                                name="profileImage" ref={fileInputRef} /> <button onClick={onUpdateImage}>Update
                                    Image</button> <br />
                    </div>
            }
            <br />

            <Link to="/Users">
                <button>Users</button>
            </Link>

            <Link to="/logout">
                <button>Logout</button>
            </Link>

        </div>
    )
}
