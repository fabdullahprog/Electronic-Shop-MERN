import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiUserX, FiUserCheck } from 'react-icons/fi';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = async (q = search) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/users?search=${q}&limit=50`);
      setUsers(data.users); setTotal(data.total);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (id, current, name) => {
    if (!window.confirm(`${current ? 'Deactivate' : 'Activate'} user "${name}"?`)) return;
    try {
      await API.put(`/users/${id}`, { isActive: !current });
      toast.success('User updated');
      fetchUsers();
    } catch { toast.error('Failed'); }
  };

  const makeAdmin = async (id, name) => {
    if (!window.confirm(`Make "${name}" an admin?`)) return;
    try { await API.put(`/users/${id}`, { role: 'admin' }); toast.success('Role updated'); fetchUsers(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Users Management</h1>
        <span style={{ background:'var(--primary-light)', color:'var(--primary)', padding:'6px 16px', borderRadius:20, fontWeight:600 }}>{total} Users</span>
      </div>
      <div className="card card-body" style={{ marginBottom:20 }}>
        <form onSubmit={e => { e.preventDefault(); fetchUsers(); }} style={{ display:'flex', gap:8 }}>
          <div className="search-input"><FiSearch color="var(--gray-400)" /><input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
      </div>
      <div className="admin-table-wrap">
        {loading ? <div className="page-loader"><div className="spinner"></div></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{u.name?.charAt(0)}</div>
                      <span style={{ fontWeight:600 }}>{u.name}</span>
                    </td>
                    <td style={{ fontSize:13 }}>{u.email}</td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{u.phone||'—'}</td>
                    <td><span className={`badge badge-${u.role==='admin'?'primary':'info'}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.isEmailVerified?'success':'warning'}`}>{u.isEmailVerified?'Yes':'No'}</span></td>
                    <td><span className={`badge badge-${u.isActive?'success':'danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                    <td style={{ fontSize:13, color:'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString('en-BD')}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className={`btn btn-sm btn-${u.isActive?'danger':'success'}`} onClick={() => toggleActive(u._id, u.isActive, u.name)} title={u.isActive?'Deactivate':'Activate'}>
                          {u.isActive ? <FiUserX /> : <FiUserCheck />}
                        </button>
                        {u.role!=='admin' && <button className="btn btn-outline btn-sm" onClick={() => makeAdmin(u._id, u.name)} title="Make Admin"><FiUser /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length===0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--gray-400)' }}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminUsers;
