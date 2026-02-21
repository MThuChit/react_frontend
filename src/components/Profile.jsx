import { useUser } from "../context/UserProvider";
import { useCallback, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Profile() {
  const { logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [data, setData] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  function setMessages({ success = "", error = "" }) {
    setSuccessMessage(success);
    setErrorMessage(error);
  }

  function updateFormField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function applyProfile(nextProfile) {
    setData(nextProfile || {});
    setFormData({
      firstname: nextProfile?.firstname || "",
      lastname: nextProfile?.lastname || "",
      email: nextProfile?.email || "",
    });
  }

  async function onUpdateImage() {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setMessages({ error: "Please select an image file." });
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessages({ error: "Only image file types are allowed." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingImage(true);
    setMessages({});

    try {
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        await fetchProfile();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setMessages({ success: "Profile image updated." });
      } else {
        const result = await response.json().catch(() => null);
        setMessages({ error: result?.message || "Failed to update image." });
      }
    } catch {
      setMessages({ error: "Error uploading image." });
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function onDeleteImage() {
    setIsDeletingImage(true);
    setMessages({});

    try {
      const response = await fetch(`${API_URL}/api/user/profile/image`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        await fetchProfile();
        setMessages({ success: "Profile image removed." });
      } else {
        const result = await response.json().catch(() => null);
        setMessages({ error: result?.message || "Failed to remove image." });
      }
    } catch {
      setMessages({ error: "Error removing image." });
    } finally {
      setIsDeletingImage(false);
    }
  }

  async function onSaveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessages({});

    const payload = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
    };

    try {
      const result = await fetch(`${API_URL}/api/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        logout();
        return;
      }

      if (!result.ok) {
        const errorData = await result.json().catch(() => null);
        setMessages({ error: errorData?.message || "Failed to update profile." });
        return;
      }

      const updatedProfile = await result.json();
      applyProfile(updatedProfile);
      setMessages({ success: "Profile updated." });
    } catch {
      setMessages({ error: "Profile update failed." });
    } finally {
      setIsSaving(false);
    }
  }

  const fetchProfile = useCallback(async () => {
    try {
      const result = await fetch(`${API_URL}/api/user/profile`, {
        credentials: "include",
      });
      if (result.status === 401) {
        logout();
        return;
      }
      if (!result.ok) {
        console.log("Profile load failed:", result.status);
        return;
      }
      const nextData = await result.json();
      applyProfile(nextData);
    } catch (err) {
      console.log("Profile fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <p className="eyebrow">Signed in</p>
            <h2>{(data.firstname || "").trim()} {(data.lastname || "").trim()}</h2>
            <p className="muted">{data.email || "-"}</p>
          </div>
          <div className="avatar">
            {data.profileImage ? (
              <img src={`${API_URL}${data.profileImage}`} alt="Profile" />
            ) : (
              <div className="avatar-fallback">{(data.firstname || "U")[0]}</div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="muted">Loading profile…</div>
        ) : (
          <form className="profile-form" onSubmit={onSaveProfile}>
            <div className="field profile-id">
              <label>User ID</label>
              <input value={data._id || ""} readOnly />
            </div>
            <div className="field">
              <label>First Name</label>
              <input
                value={formData.firstname}
                onChange={(event) => updateFormField("firstname", event.target.value)}
              />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input
                value={formData.lastname}
                onChange={(event) => updateFormField("lastname", event.target.value)}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => updateFormField("email", event.target.value)}
              />
            </div>
            <div className="field">
              <label>Status</label>
              <span className="pill">{data.status || "ACTIVE"}</span>
            </div>
            <div className="profile-save-row">
              <button className="btn btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        <div className="upload-row">
          <input type="file" ref={fileInputRef} accept="image/*" />
          <button className="btn btn-primary" onClick={onUpdateImage} disabled={isUploadingImage}>
            {isUploadingImage ? "Uploading..." : "Update Image"}
          </button>
          {data.profileImage && (
            <button className="btn btn-danger" onClick={onDeleteImage} disabled={isDeletingImage}>
              {isDeletingImage ? "Removing..." : "Remove Image"}
            </button>
          )}
        </div>

        {errorMessage && <p className="profile-error">{errorMessage}</p>}
        {successMessage && <p className="profile-success">{successMessage}</p>}

        <div className="profile-actions">
          <Link to="/users"><button className="btn btn-ghost">User Management</button></Link>
          <Link to="/logout"><button className="btn btn-danger">Logout</button></Link>
        </div>
      </div>
    </div>
  );
}
