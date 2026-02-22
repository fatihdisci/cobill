import { useState } from 'react';
import { Ghost, UserPlus, X, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateId, getInitials, getAvatarColor } from '../utils/helpers';

export default function MemberManager({ groupId, onClose }) {
    const { state, dispatch } = useApp();
    const group = state.groups.find(g => g.id === groupId);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isGhost, setIsGhost] = useState(true);

    if (!group) return null;

    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const id = generateId();
        const newMember = {
            id,
            name: name.trim(),
            email: email.trim(),
            isGhost,
            phone: '',
        };

        dispatch({ type: 'ADD_MEMBER', payload: newMember });
        dispatch({ type: 'ADD_MEMBER_TO_GROUP', payload: { groupId, memberId: id } });

        setName('');
        setEmail('');
    };

    const handleRemove = (memberId) => {
        dispatch({ type: 'REMOVE_MEMBER_FROM_GROUP', payload: { groupId, memberId } });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Üyeleri Yönet</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Member List */}
                <div className="flex flex-col gap-sm mb-xl">
                    {groupMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-md" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div className="avatar avatar-sm" style={{ background: getAvatarColor(member.id) }}>
                                {getInitials(member.name)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="text-sm font-semibold flex items-center gap-sm">
                                    {member.name}
                                    {member.isGhost && (
                                        <span className="badge badge-ghost">
                                            <Ghost size={9} /> Hayalet
                                        </span>
                                    )}
                                </div>
                                {member.email && (
                                    <div className="text-xs text-muted flex items-center gap-xs">
                                        <Mail size={10} /> {member.email}
                                    </div>
                                )}
                            </div>
                            {member.id !== state.currentUser && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(member.id)}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="divider" />

                {/* Add New Member */}
                <h4 className="text-sm mb-md" style={{ color: 'var(--text-secondary)' }}>Yeni Üye Ekle</h4>
                <form onSubmit={handleAddMember} className="flex flex-col gap-md">
                    <div className="form-group">
                        <label className="form-label">İsim *</label>
                        <input
                            className="form-input"
                            placeholder="Örn: Ahmet, Ev Sahibi..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta (opsiyonel)</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="ornek@mail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between" style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="flex items-center gap-sm">
                            <Ghost size={16} style={{ color: 'var(--text-tertiary)' }} />
                            <div>
                                <div className="text-sm font-medium">Hayalet Kullanıcı</div>
                                <div className="text-xs text-muted">Uygulamayı kullanmasına gerek yok</div>
                            </div>
                        </div>
                        <div
                            className={`toggle ${isGhost ? 'active' : ''}`}
                            onClick={() => setIsGhost(!isGhost)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={!name.trim()}>
                        <UserPlus size={16} /> Üye Ekle
                    </button>
                </form>
            </div>
        </div>
    );
}
