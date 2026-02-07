import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", firstname: "", lastname: "", status: "" });
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        // token cookie cleared by server, navigate to login
        navigate("/login");
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Logout failed: " + (err.message || res.status));
      }
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch(`${API_URL}/api/user`, { credentials: "include" });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function startEdit(user) {
    // normalize id: prefer user._id.$oid (mongo view) or plain string
    const id = user._id && user._id.$oid ? user._id.$oid : user._id;
    setEditing(id);
    setForm({
      username: user.username || "",
      email: user.email || "",
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      status: user.status || ""
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ username: "", email: "", firstname: "", lastname: "", status: "" });
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      const id = encodeURIComponent(String(editing));
      console.log("Saving user id:", id, "payload:", form);
      const res = await fetch(`${API_URL}/api/user/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await loadUsers();
        cancelEdit();
      } else {
        let errBody = { message: res.status };
        try { errBody = await res.json(); } catch (_) {}
        alert("Update failed: " + (errBody.message || res.status));
        console.error("Update failed response:", res.status, errBody);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Update failed: " + (err?.message || "Failed to fetch"));
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_URL}/api/user/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        await loadUsers();
      } else {
        const err = await res.json();
        alert("Delete failed: " + (err.message || res.status));
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>User Management</h2>
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>First</th><th>Last</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td style={{ maxWidth: 160, overflow: "hidden" }}>{u._id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.firstname}</td>
              <td>{u.lastname}</td>
              <td>{u.status}</td>
              <td>
                <button onClick={() => startEdit(u)}>Edit</button>
                <button onClick={() => deleteUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div style={{ marginTop: 20 }}>
          <h3>Editing user: {editing}</h3>
          <div>
            <label>Username: <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></label>
          </div>
          <div>
            <label>Email: <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label>
          </div>
          <div>
            <label>First name: <input value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} /></label>
          </div>
          <div>
            <label>Last name: <input value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} /></label>
          </div>
          <div>
            <label>Status: <input value={form.status} onChange={e => setForm({...form, status: e.target.value})} /></label>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={saveEdit}>Save</button>
            <button onClick={cancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}