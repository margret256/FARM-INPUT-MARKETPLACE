import { useRef, useState } from 'react';
import { User, Pencil, Lock, Wallet, MapPin, ChevronRight, LogOut, Leaf, X } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { auth } from '../api/client';

type Role = 'dealer' | 'farmer' | 'admin';

interface FieldConfig {
  key: 'firstName' | 'phone' | 'email' | 'location' | 'farmType' | 'farmSize' | 'businessName' | 'address';
  label: string;
  persisted: boolean;
}

export default function Profile({ role = 'farmer', onLogout }: { role?: Role; onLogout?: () => void }) {
  const { profile, loading, error, saving, saveError, save, changeAvatar } = useProfile();
  const [editVisible, setEditVisible] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDealer = role === 'dealer';
  const isAdmin = role === 'admin';

  const editFields: FieldConfig[] = isDealer
    ? [
        { key: 'businessName', label: 'Business Name', persisted: true },
        { key: 'phone', label: 'Phone Number', persisted: true },
        { key: 'email', label: 'Email Address', persisted: true },
        { key: 'address', label: 'Business Location', persisted: true },
      ]
    : [
        { key: 'firstName', label: 'Full Name', persisted: true },
        { key: 'phone', label: 'Phone Number', persisted: true },
        { key: 'email', label: 'Email Address', persisted: true },
        { key: 'location', label: 'Location', persisted: false },
        { key: 'farmType', label: 'Farm Type', persisted: false },
        { key: 'farmSize', label: 'Farm Size', persisted: false },
      ];

  function openEdit() {
    if (!profile) return;
    const initial: Record<string, string> = {};
    for (const f of editFields) {
      if (f.key === 'businessName' || f.key === 'address') {
        initial[f.key] = (profile as any).dealer?.[f.key] ?? '';
      } else {
        initial[f.key] = (profile as any)[f.key] ?? '';
      }
    }
    setForm(initial);
    setEditVisible(true);
  }

  async function handleSave() {
    const persistedFields = editFields.filter((f) => f.persisted);
    const payload: Record<string, string> = {};
    for (const f of persistedFields) payload[f.key] = form[f.key];

    const ok = await save(payload);
    if (ok) setEditVisible(false);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await changeAvatar(file);
    e.target.value = '';
  }

  function handleLogout() {
    auth.logout();
    onLogout?.();
  }

  if (loading && !profile) {
    return <div className="page-content"><div className="section-card"><p className="section-title">Loading profile…</p></div></div>;
  }

  if (error && !profile) {
    return (
      <div className="page-content">
        <div className="section-card">
          <p className="section-title">Couldn't load profile</p>
          <p className="tool-desc">{error}</p>
        </div>
      </div>
    );
  }

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
  const roleLabel = isAdmin ? 'System Administrator' : isDealer ? 'Verified Dealer' : 'Verified Farmer';
  const subLine = isDealer ? (profile as any)?.dealer?.address : profile?.location;

  return (
    <div className="page-content">
      {/* Banner — overflow:visible is critical so the avatar + edit badge aren't clipped */}
      <div
        className="hero-card green-card"
        style={{ position: 'relative', height: 160, overflow: 'visible', marginBottom: 64 }}
      >
        <div style={{ position: 'absolute', bottom: -40, left: 32, overflow: 'visible' }}>
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                border: '4px solid #fff',
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={34} color="#1B5E20" />
            </div>
          )}
          <button
            onClick={handleAvatarClick}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#F57C00',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              zIndex: 2,
            }}
          >
            <Pencil size={13} color="#fff" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
      </div>

      <div style={{ marginLeft: 32, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 900, margin: 0 }}>{displayName}</h2>
        <p className="tool-desc" style={{ margin: '4px 0 0' }}>
          {roleLabel}{subLine ? ` · ${subLine}` : ''}
        </p>
      </div>

      {/* Two-column layout with generous gap so cards don't feel congested */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
        <div>
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div className="section-header"><User size={16} /><h3 className="section-title">Personal Information</h3></div>
            <div className="activity-row"><span className="activity-meta">Phone Number</span><strong>{profile?.phone}</strong></div>
            <div className="activity-row"><span className="activity-meta">Email Address</span><strong>{profile?.email}</strong></div>
            {isDealer ? (
              <div className="activity-row"><span className="activity-meta">Business Location</span><strong>{(profile as any)?.dealer?.address ?? 'Not set'}</strong></div>
            ) : (
              <div className="activity-row"><span className="activity-meta">Location</span><strong>{profile?.location ?? 'Not set'}</strong></div>
            )}
          </div>

          {isDealer && (
            <div className="section-card" style={{ marginBottom: 24 }}>
              <div className="section-header"><Leaf size={16} /><h3 className="section-title">Business Information</h3></div>
              <div className="activity-row"><span className="activity-meta">Business Name</span><strong>{(profile as any)?.dealer?.businessName ?? 'Not set'}</strong></div>
              <div className="activity-row"><span className="activity-meta">Verification Status</span><strong>{(profile as any)?.dealer?.verificationStatus ?? 'Pending'}</strong></div>
            </div>
          )}

          {!isDealer && !isAdmin && (
            <div className="section-card" style={{ marginBottom: 24 }}>
              <div className="section-header"><Leaf size={16} /><h3 className="section-title">Farm Information</h3></div>
              <div className="activity-row"><span className="activity-meta">Farm type</span><strong>{profile?.farmType ?? 'Not set'}</strong></div>
              <div className="activity-row"><span className="activity-meta">Farm size</span><strong>{profile?.farmSize ?? 'Not set'}</strong></div>
            </div>
          )}
        </div>

        <div>
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div className="section-header"><h3 className="section-title">Account Settings</h3></div>
            {[
              { label: 'Change password', icon: Lock },
              { label: 'Payment methods', icon: Wallet },
              { label: 'Delivery addresses', icon: MapPin },
            ].map(({ label, icon: Icon }) => (
              <button key={label} className="activity-row" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon size={16} />
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                <ChevronRight size={16} className="chevron-muted" />
              </button>
            ))}
          </div>

          <button className="btn-primary" style={{ width: '100%', marginBottom: 12, justifyContent: 'center' }} onClick={openEdit}>
            <Pencil size={16} /> Edit Profile
          </button>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#FDE8E8', color: '#D32F2F' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {editVisible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440, maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="section-header">
              <h3 className="section-title">Edit Profile</h3>
              <button onClick={() => setEditVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {saveError && <p className="pill danger" style={{ marginBottom: 12 }}>{saveError}</p>}

            {editFields.map((f) => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label className="tool-desc" style={{ display: 'block', marginBottom: 4 }}>
                  {f.label}{!f.persisted && ' (not saved yet — needs backend field)'}
                </label>
                <input
                  style={{ width: '100%', height: 42, borderRadius: 8, border: '1px solid #DDE6D6', padding: '0 12px' }}
                  value={form[f.key] ?? ''}
                  disabled={!f.persisted}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              </div>
            ))}

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}