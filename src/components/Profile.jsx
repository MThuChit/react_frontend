import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, { credentials: "include" });
      if (res.status === 401) { navigate("/logout"); return; }
      const d = await res.json();
      setData(d);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProfile(); }, []);

  async function onUpdateImage() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) { setMsg("Select a file"); return; }
    setUploading(true); setMsg("");
    try {
      const form = new FormData();
      form.append("profileImage", file);
      const res = await fetch(`${API_URL}/api/user/profile`, { method: "PATCH", credentials: "include", body: form });
      if (!res.ok) {
        const alt = await (await fetch(`${API_URL}/api/user/profile/image`, { method: "POST", credentials: "include", body: form })).json().catch(()=>({}));
        if (!alt || alt.message) throw new Error("Upload failed");
      }
      setMsg("Updated");
      await fetchProfile();
    } catch (e) {
      console.error(e);
      setMsg("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2 className="profile-title">{loading ? "Profile..." : "Profile"}</h2>

        <div className="profile-grid">
          <div className="profile-avatar-wrap">
            <div className="avatar">
              {data?.profileImage ? (
                <img src={data.profileImage.startsWith("http") ? data.profileImage : `${API_URL}${data.profileImage}`} alt="profile" />
              ) : (
                <div className="avatar-fallback">{(data?.firstname || "").charAt(0) || "?"}</div>
              )}
            </div>
          </div>

          <div className="profile-info">
            <div className="info-row"><span className="label">ID:</span><span className="value">{data?._id || "—"}</span></div>
            <div className="info-row"><span className="label">Email:</span><span className="value">{data?.email || "—"}</span></div>
            <div className="info-row"><span className="label">First name:</span><span className="value">{data?.firstname || "—"}</span></div>
            <div className="info-row"><span className="label">Last name:</span><span className="value">{data?.lastname || "—"}</span></div>
          </div>
        </div>

        <div className="profile-controls">
          <label className="file-label">
            <input ref={fileInputRef} type="file" accept="image/*" className="file-input" />
          </label>
          <button className="btn primary" onClick={onUpdateImage} disabled={uploading}>{uploading ? "Uploading…" : "Update Image"}</button>
        </div>

        {msg && <div className="profile-msg">{msg}</div>}

        <div className="profile-actions">
          <Link to="/Users" className="btn dark">Users</Link>
          <Link to="/logout" className="btn dark">Logout</Link>
        </div>
      </div>
    </div>
  );
}
