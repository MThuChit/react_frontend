import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageBusy, setIsImageBusy] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: "", text: "" });
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
  });
  const imageInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  function setUserInList(updatedUser) {
    setUsers((prev) => prev.map((user) => (user._id === updatedUser._id ? { ...user, ...updatedUser } : user)));
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setIsSaving(false);
    setIsImageBusy(false);
    setModalMessage({ type: "", text: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/api/user`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("API did not return a list:", data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Username, email and password are required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) {
        const msg = await res.text();
        alert("Create failed: " + msg);
        return;
      }

      await fetchUsers();
      setNewUser({
        username: "",
        email: "",
        password: "",
        firstname: "",
        lastname: "",
      });
      alert("User created. They can now log in.");
    } catch (error) {
      console.error("Create failed:", error);
      alert("Create failed");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/api/user/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setUsers((prev) => prev.filter((user) => user._id !== id));
      if (editingUser?._id === id) {
        closeModal();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  }

  function openEditModal(user) {
    setEditingUser({ ...user });
    setModalMessage({ type: "", text: "" });
    setIsModalOpen(true);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  }

  async function saveUser() {
    if (!editingUser) return;
    setIsSaving(true);
    setModalMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: editingUser.firstname,
          lastname: editingUser.lastname,
          email: editingUser.email,
        }),
      });

      if (res.ok) {
        setUserInList(editingUser);
        setModalMessage({ type: "success", text: "User updated successfully." });
      } else {
        const msg = await res.text();
        setModalMessage({ type: "error", text: "Failed to update user. " + msg });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setModalMessage({ type: "error", text: "Error updating user." });
    } finally {
      setIsSaving(false);
    }
  }

  async function updateUserImage() {
    if (!editingUser) return;

    const file = imageInputRef.current?.files?.[0];
    if (!file) {
      setModalMessage({ type: "error", text: "Please select an image file first." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setModalMessage({ type: "error", text: "Only image file types are allowed." });
      return;
    }

    setIsImageBusy(true);
    setModalMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalMessage({ type: "error", text: result.message || "Failed to update image." });
        return;
      }

      const updated = { ...editingUser, profileImage: result.imageUrl };
      setEditingUser(updated);
      setUserInList(updated);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setModalMessage({ type: "success", text: "Image updated successfully." });
    } catch (error) {
      console.error("Failed to update image:", error);
      setModalMessage({ type: "error", text: "Failed to update image." });
    } finally {
      setIsImageBusy(false);
    }
  }

  async function removeUserImage() {
    if (!editingUser) return;

    setIsImageBusy(true);
    setModalMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_URL}/api/user/${editingUser._id}/image`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setModalMessage({ type: "error", text: result.message || "Failed to remove image." });
        return;
      }

      const updated = { ...editingUser, profileImage: null };
      setEditingUser(updated);
      setUserInList(updated);
      setModalMessage({ type: "success", text: "Image removed successfully." });
    } catch (error) {
      console.error("Failed to remove image:", error);
      setModalMessage({ type: "error", text: "Failed to remove image." });
    } finally {
      setIsImageBusy(false);
    }
  }

  return (
    <div className="user-page">
      <div className="user-card">
        <div className="user-header">
          <div>
            <h2 style={{ margin: 0 }}>User Management</h2>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>Create, edit or remove accounts</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/profile"><button className="btn btn-ghost">Back to Profile</button></Link>
            <button className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
          </div>
        </div>

        <form className="new-user-form" onSubmit={handleCreate}>
          <div className="field"><label>Username</label><input value={newUser.username} onChange={(event) => setNewUser({ ...newUser, username: event.target.value })} /></div>
          <div className="field"><label>Email</label><input type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></div>
          <div className="field"><label>Password</label><input type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} /></div>
          <div className="field"><label>First Name</label><input value={newUser.firstname} onChange={(event) => setNewUser({ ...newUser, firstname: event.target.value })} /></div>
          <div className="field"><label>Last Name</label><input value={newUser.lastname} onChange={(event) => setNewUser({ ...newUser, lastname: event.target.value })} /></div>
          <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>Add User</button>
        </form>

        <table className="user-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="user-row">
                <td>
                  <div className="user-avatar user-avatar-small">
                    {user.profileImage ? (
                      <img src={`${API_URL}${user.profileImage}`} alt={`${user.username || "user"} profile`} />
                    ) : (
                      <span>{(user.firstname || user.username || "U")[0]}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{user.firstname} {user.lastname}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>@{user.username}</div>
                </td>
                <td>{user.email}</td>
                <td><span className="pill">{user.status || "ACTIVE"}</span></td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn btn-ghost" onClick={() => openEditModal(user)}>Edit</button>
                  &nbsp;
                  <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: "18px" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingUser && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="user-header" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Edit User</h3>
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            </div>

            <div className="modal-image-panel">
              <div className="user-avatar user-avatar-large">
                {editingUser.profileImage ? (
                  <img src={`${API_URL}${editingUser.profileImage}`} alt={`${editingUser.username || "user"} profile`} />
                ) : (
                  <span>{(editingUser.firstname || editingUser.username || "U")[0]}</span>
                )}
              </div>
              <div className="modal-image-controls">
                <input type="file" accept="image/*" ref={imageInputRef} />
                <div className="modal-image-actions">
                  <button className="btn btn-primary" onClick={updateUserImage} disabled={isImageBusy}>
                    {isImageBusy ? "Working..." : "Update Image"}
                  </button>
                  {editingUser.profileImage && (
                    <button className="btn btn-danger" onClick={removeUserImage} disabled={isImageBusy}>
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            {modalMessage.text && (
              <p className={modalMessage.type === "error" ? "modal-error" : "modal-success"}>{modalMessage.text}</p>
            )}

            <div className="form-grid">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={editingUser.firstname || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={editingUser.lastname || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={saveUser} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(editingUser._id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}