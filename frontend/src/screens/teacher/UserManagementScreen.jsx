import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/client';
import {
  Users,
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  Search,
  Key,
  Mail,
  Phone,
  Trash2,
  Copy,
  Check,
  GraduationCap,
  Heart,
  Crown,
  Lock,
  User,
  Sparkles
} from 'lucide-react';

const UserManagementScreen = ({ onBack }) => {
  const { user, addCustomUser, getCustomUsers } = useAuth();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'teacher',
    phone: '',
    subjects: ''
  });

  // Load users from API or Local
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else {
        fallbackLocalUsers();
      }
    } catch {
      fallbackLocalUsers();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalUsers = () => {
    const customUsers = getCustomUsers ? getCustomUsers() : [];
    const defaults = [
      {
        id: 'user_admin_001',
        name: 'Institute Owner / Admin (ප්‍රධාන පරිපාලක)',
        email: 'admin@tuition.lk',
        role: 'admin',
        phone: '+94 77 123 4567',
        subjects: 'Institute Administration'
      }
    ];
    setUsers([...defaults, ...customUsers]);
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in Name, Email and Password');
      return;
    }

    try {
      await addCustomUser(formData);
      setStatusMsg({ type: 'success', text: `Account for ${formData.name} created successfully!` });
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'teacher',
        phone: '',
        subjects: ''
      });
      fetchUsers();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error creating account. Please try again.' });
    }
  };

  const handleCopyCredentials = (account) => {
    const text = `Tuition Portal Login Credentials:\nEmail: ${account.email}\nPassword: ${account.password || 'password123'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(account.id || account._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.email === 'admin@tuition.lk') {
      alert('The Primary Admin account cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete account for ${targetUser.name}?`)) return;

    try {
      if (targetUser.id && !targetUser.id.startsWith('custom_')) {
        await api.deleteUser(targetUser.id || targetUser._id);
      }
    } catch {
      // Ignore API errors, delete locally
    }

    // Delete from localStorage custom users
    try {
      const stored = localStorage.getItem('edutuition_custom_users');
      if (stored) {
        const customUsers = JSON.parse(stored);
        const filtered = customUsers.filter(u => u.email !== targetUser.email && u.id !== targetUser.id);
        localStorage.setItem('edutuition_custom_users', JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }

    setUsers(prev => prev.filter(u => u.email !== targetUser.email && (u.id || u._id) !== (targetUser.id || targetUser._id)));
    setStatusMsg({ type: 'success', text: `Account deleted.` });
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all') {
      if (filterRole === 'admin' && (u.role !== 'admin' && u.email !== 'admin@tuition.lk')) return false;
      if (filterRole !== 'admin' && u.role !== filterRole) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getRoleBadge = (account) => {
    if (account.email === 'admin@tuition.lk' || account.role === 'admin') {
      return { label: '👑 Admin (පරිපාලක)', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
    }
    if (account.role === 'teacher') {
      return { label: '👨‍🏫 Teacher (ගුරුතුමා)', bg: 'rgba(79, 70, 229, 0.15)', color: '#4F46E5' };
    }
    if (account.role === 'student') {
      return { label: '👨‍🎓 Student (සිසුවා)', bg: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' };
    }
    if (account.role === 'parent') {
      return { label: '👪 Parent (දෙමාපිය)', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
    }
    return { label: account.role, bg: 'rgba(100, 116, 139, 0.15)', color: '#64748B' };
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: colors.text, margin: 0 }}>
              User Accounts & Access
            </h1>
            <p style={{ fontSize: '11px', color: colors.textMuted, margin: '2px 0 0 0' }}>
              Create and manage Teacher, Student & Parent logins
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            border: 'none',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
        >
          <UserPlus size={16} />
          <span>Add Account</span>
        </button>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMsg.type === 'success' ? '#10B981' : '#EF4444'}`,
            color: statusMsg.type === 'success' ? '#10B981' : '#EF4444',
            fontSize: '12px',
            fontWeight: '700'
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              color: colors.text,
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'admin', label: '👑 Admins' },
            { id: 'teacher', label: '👨‍🏫 Teachers' },
            { id: 'student', label: '👨‍🎓 Students' },
            { id: 'parent', label: '👪 Parents' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                backgroundColor: filterRole === tab.id ? colors.primary : colors.surface,
                border: `1px solid ${filterRole === tab.id ? colors.primary : colors.border}`,
                color: filterRole === tab.id ? '#FFFFFF' : colors.text,
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Count Summary */}
      <div style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Total Registered Accounts: {filteredUsers.length}
      </div>

      {/* Users List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px' }}>
            Loading accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: colors.textMuted, fontSize: '13px', backgroundColor: colors.surface, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
            No accounts match your criteria.
          </div>
        ) : (
          filteredUsers.map(acc => {
            const badge = getRoleBadge(acc);
            const isSelf = acc.email === user?.email;
            const isSuperAdmin = acc.email === 'admin@tuition.lk';

            return (
              <div
                key={acc.id || acc._id || acc.email}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: '16px',
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: colors.cardShadow,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '16px',
                        flexShrink: 0
                      }}
                    >
                      {acc.name ? acc.name[0] : 'U'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: colors.text }}>
                          {acc.name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}
                        >
                          {badge.label}
                        </span>
                        {isSelf && (
                          <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#10B981', color: '#FFF', padding: '2px 6px', borderRadius: '6px' }}>
                            You (Current)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.textMuted }}>
                          <Mail size={12} />
                          <span>{acc.email}</span>
                        </div>
                        {acc.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.textMuted }}>
                            <Phone size={12} />
                            <span>{acc.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.border}`, paddingTop: '10px', marginTop: '2px' }}>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    Default Pass: <code style={{ backgroundColor: colors.surfaceSubtle, padding: '2px 6px', borderRadius: '6px', fontWeight: '700', color: colors.text }}>{acc.password || (isSuperAdmin ? 'admin123' : 'password123')}</code>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(acc)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        backgroundColor: copiedId === (acc.id || acc._id) ? '#10B981' : colors.surfaceSubtle,
                        border: `1px solid ${colors.border}`,
                        color: copiedId === (acc.id || acc._id) ? '#FFFFFF' : colors.text,
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedId === (acc.id || acc._id) ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === (acc.id || acc._id) ? 'Copied!' : 'Copy Login'}</span>
                    </button>

                    {!isSuperAdmin && !isSelf && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(acc)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: colors.surface,
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: `1px solid ${colors.border}`,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.15)', color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: colors.text, margin: 0 }}>
                    Create New Account
                  </h2>
                  <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>
                    Add Teacher, Student, or Parent Login
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '6px' }}>
                  ACCOUNT ROLE (ගිණුම් වර්ගය)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'teacher', label: '👨‍🏫 Teacher' },
                    { id: 'student', label: '👨‍🎓 Student' },
                    { id: 'parent', label: '👪 Parent' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      style={{
                        padding: '10px 6px',
                        borderRadius: '10px',
                        backgroundColor: formData.role === r.id ? colors.primary : colors.surfaceSubtle,
                        border: `1px solid ${formData.role === r.id ? colors.primary : colors.border}`,
                        color: formData.role === r.id ? '#FFFFFF' : colors.text,
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Full Name (සම්පූර්ණ නම) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Kumara / Kasun Bandara"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Email Address (විද්‍යුත් තැපෑල) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kumara.maths@tuition.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Password (මුරපදය) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: colors.textMuted, marginBottom: '4px' }}>
                  Phone Number (දුරකථන අංකය)
                </label>
                <input
                  type="tel"
                  placeholder="077 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: colors.surfaceSubtle,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: colors.primary,
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementScreen;
