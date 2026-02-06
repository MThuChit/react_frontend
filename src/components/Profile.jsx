import { useUser } from "../contexts/UserProvider";
import { useEffect, useState } from "react";
import profileImg from '../ss/myprofile.jpg';

export default function Profile() {
    const { user, logout } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({});
    const API_URL = import.meta.env.VITE_API_URL;

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 20,
        },
        header: {
            marginBottom: 20,
            fontSize: 28,
        },
        card: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'transparent',
            padding: 24,
            borderRadius: 12,
            maxWidth: 560,
        },
        img: {
            width: 140,
            height: 140,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: 16,
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
        },
        info: {
            fontSize: 18,
            lineHeight: 1.8,
            textAlign: 'center',
            color: 'inherit'
        },
        logoutBtn: {
            marginTop: 20,
            background: '#111',
            color: '#fff',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 10,
            cursor: 'pointer'
        }
    };

    async function fetchProfile() {
        const result = await fetch(`${API_URL}/api/user/profile`, {
            credentials: "include"
        });
        if (result.status == 401) {
            logout();
        }
        else {
            const data = await result.json();
            console.log("data: ", data);
            setIsLoading(false);
            setData(data);
        }
    }
    useEffect(() => {
        fetchProfile();
    }, []);
    return (
        <div style={styles.container}>
            <h3 style={styles.header}>Profile...</h3>
            {
                isLoading ?
                    <div>Loading...</div> :
                    <div style={styles.card}>
                        <img src={profileImg} alt="Profile" style={styles.img} />
                        <div style={styles.info}>
                            <div>ID: {data._id}</div>
                            <div>Email: {data.email}</div>
                            <div>First Name: {data.firstname}</div>
                            <div>Last Name: {data.lastname}</div>
                        </div>
                        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
                    </div>
            }
        </div>
    )
}