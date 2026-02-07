import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Users.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", firstname: "", lastname: "", status: "" });
  const [addForm, setAddForm] = useState({ username: "", email: "", firstname: "", lastname: "", status: "ACTIVE", password: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const res = await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
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
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/user`, { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  function normalizeId(user) {
    return user && user._id && user._id.$oid ? user._id.$oid : (user && user._id ? user._id : "");
  }

  function startEdit(user) {
    setError("");
    const id = normalizeId(user);
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
    setError("");
  }

  function openAdd() {
    setError("");
    setAdding(true);
    setAddForm({ username: "", email: "", firstname: "", lastname: "", status: "ACTIVE", password: "" });
  }

  function cancelAdd() {
    setAdding(false);
    setAddForm({ username: "", email: "", firstname: "", lastname: "", status: "ACTIVE", password: "" });
    setError("");
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const id = encodeURIComponent(String(editing));
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
        setError(errBody.message || `Update failed: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch");
    } finally {
      setSaving(false);
    }
  }

  async function addUser() {
    setSaving(true);
    setError("");
    try {
      if (!addForm.username || !addForm.email) {
        setError("Username and email required");
        setSaving(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/user`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        await loadUsers();
        cancelAdd();
      } else {
        let errBody = { message: res.status };
        try { errBody = await res.json(); } catch (_) {}
        setError(errBody.message || `Create failed: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(rawId) {
    const id = encodeURIComponent(String(rawId && rawId.$oid ? rawId.$oid : rawId));
    if (!window.confirm("Delete this user?")) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/user/${id}`, { method: "DELETE", credentials: "include", mode: "cors" });
      if (res.ok) {
        await loadUsers();
      } else {
        let errBody = { message: res.status };
        try { errBody = await res.json(); } catch (_) {}
        setError(errBody.message || `Delete failed: ${res.status}`);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch");
    }
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="users-actions">
          <button onClick={openAdd} className="btn primary">Add User</button>
          <button onClick={handleLogout} className="btn dark">Logout</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th className="th">ID</th><th className="th">Username</th><th className="th">Email</th><th className="th">First</th><th className="th">Last</th><th className="th">Status</th><th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="td">Loading users…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="td">No users found</td></tr>
            ) : users.map(u => (
              <tr key={normalizeId(u)}>
                <td className="td id">{normalizeId(u)}</td>
                <td className="td">{u.username}</td>
                <td className="td">{u.email}</td>
                <td className="td">{u.firstname}</td>
                <td className="td">{u.lastname}</td>
                <td className="td">{u.status}</td>
                <td className="td">
                  <button onClick={() => startEdit(u)} className="actionBtn">Edit</button>
                  <button onClick={() => deleteUser(u._id)} className="actionBtn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal">
          <div className="modalContent">
            <h3>Edit user</h3>
            <div className="row">
              <label className="label">Username
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" />
              </label>
              <label className="label">Email
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" />
              </label>
            </div>
            <div className="row">
              <label className="label">First name
                <input value={form.firstname} onChange={e => setForm({ ...form, firstname: e.target.value })} className="input" />
              </label>
              <label className="label">Last name
                <input value={form.lastname} onChange={e => setForm({ ...form, lastname: e.target.value })} className="input" />
              </label>
            </div>
            <label className="label">Status
              <input value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input" />
            </label>

            <div className="modalActions">
              <button onClick={saveEdit} className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={cancelEdit} className="btn dark">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {adding && (
        <div className="modal">
          <div className="modalContent">
            <h3>Add user</h3>
            <div className="row">
              <label className="label">Username
                <input value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} className="input" />
              </label>
              <label className="label">Email
                <input value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className="input" />
              </label>
            </div>
            <div className="row">
              <label className="label">First name
                <input value={addForm.firstname} onChange={e => setAddForm({ ...addForm, firstname: e.target.value })} className="input" />
              </label>
              <label className="label">Last name
                <input value={addForm.lastname} onChange={e => setAddForm({ ...addForm, lastname: e.target.value })} className="input" />
              </label>
            </div>
            <div className="row">
              <label className="label">Status
                <input value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })} className="input" />
              </label>
              <label className="label">Password
                <input value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} type="password" className="input" />
              </label>
            </div>

            <div className="modalActions">
              <button onClick={addUser} className="btn primary" disabled={saving}>{saving ? "Creating…" : "Create"}</button>
              <button onClick={cancelAdd} className="btn dark">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}