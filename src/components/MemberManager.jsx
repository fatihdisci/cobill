import { useState } from 'react';
import { Ghost, UserPlus, X, Mail, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dbService } from '../utils/dbService';
import { generateId, getInitials, getAvatarColor } from '../utils/helpers';

export default function MemberManager({ groupId, onClose }) {
    const { state, dispatch } = useApp();
    const group = state.groups.find(g => g.id === groupId);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [iban, setIban] = useState('');
    const [isGhost, setIsGhost] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editIban, setEditIban] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!group) return null;
    const groupMembers = group.members.map(id => state.members[id]).filter(Boolean);
    const isAdmin = group.createdBy === state.currentUser;

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError('');

        if (isGhost) {
            if (!name.trim()) return;

            const id = generateId();
            const newMember = {
                id,
                name: name.trim(),
                email: email.trim(),
                iban: iban.trim(),
                isGhost: true,
                phone: '',
            };

            dispatch({ type: 'ADD_MEMBER', payload: newMember });
            dispatch({ type: 'ADD_MEMBER_TO_GROUP', payload: { groupId, memberId: id } });

            setName('');
            setEmail('');
            setIban('');
        } else {
            if (!email.trim()) {
                setError('Kullanıcı eklemek için e-posta gereklidir.');
                return;
            }
            setLoading(true);
            try {
                if (state.currentUser === 'test-user-id' && email === 'test@cobill.local') {
                    setError('Kendinizi tekrar ekleyemezsiniz.');
                    setLoading(false);
                    return;
                }

                const userDoc = await dbService.getUserByEmail(email.trim());
                if (!userDoc) {
                    setError('Bu e-posta adresine kayıtlı kullanıcı bulunamadı.');
                } else if (group.members.includes(userDoc.id)) {
                    setError('Kullanıcı zaten bu grupta.');
                } else {
                    // Kullanıcı eklendiğinde IBAN'ını gizle (getirme)
                    delete userDoc.iban;
                    dispatch({ type: 'ADD_MEMBER', payload: userDoc });
                    dispatch({ type: 'ADD_MEMBER_TO_GROUP', payload: { groupId, memberId: userDoc.id } });
                    setEmail('');
                }
            } catch (err) {
                console.error(err);
                setError('Kullanıcı aranırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveIban = (memberId) => {
        dispatch({
            type: 'UPDATE_MEMBER',
            payload: { id: memberId, iban: editIban.trim() }
        });
        setEditingId(null);
    };

    const formatIBAN = (value) => {
        const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const limited = cleaned.slice(0, 26);
        return limited.match(/.{1,4}/g)?.join(' ') || limited;
    };

    const handleRemove = (member) => {
        if (window.confirm(`"${member.name}" adlı üyeyi gruptan çıkarmak istediğinize emin misiniz?`)) {
            dispatch({ type: 'REMOVE_MEMBER_FROM_GROUP', payload: { groupId, memberId: member.id } });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Üyeleri Yönet</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Member List */}
                <div className="flex flex-col gap-sm mb-xl">
                    {groupMembers.map(member => (
                        <div key={member.id} className="flex flex-col gap-xs" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <div className="flex items-center gap-md">
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
                                <div className="flex items-center gap-xs">
                                    <button
                                        className="btn btn-ghost btn-icon btn-sm"
                                        onClick={() => {
                                            if (editingId === member.id) {
                                                setEditingId(null);
                                            } else {
                                                setEditingId(member.id);
                                                setEditIban(member.iban || '');
                                            }
                                        }}
                                        title="IBAN Düzenle"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    {isAdmin && member.id !== state.currentUser && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(member)} title="Gruptan Çıkar">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {(editingId === member.id || (member.iban && editingId !== member.id)) && (
                                <div className="mt-xs pt-xs" style={{ borderTop: '1px solid var(--border-primary)' }}>
                                    {editingId === member.id ? (
                                        <div className="flex gap-sm items-center">
                                            <input
                                                className="form-input btn-sm"
                                                style={{ height: '32px', fontSize: 'var(--font-xs)', fontFamily: 'monospace' }}
                                                placeholder="IBAN Girin (TR...)"
                                                value={editIban}
                                                onChange={(e) => setEditIban(formatIBAN(e.target.value))}
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-primary btn-sm"
                                                style={{ height: '32px', padding: '0 12px' }}
                                                onClick={() => handleSaveIban(member.id)}
                                            >
                                                Kaydet
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted font-mono" style={{ padding: '0 4px' }}>
                                            {member.iban}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="divider" />

                {/* Add New Member */}
                <h4 className="text-sm mb-md" style={{ color: 'var(--text-secondary)' }}>Yeni Üye Ekle</h4>

                <div className="flex items-center justify-between mb-md" style={{
                    padding: 'var(--space-md)',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <div className="flex items-center gap-sm">
                        <Ghost size={16} style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                            <div className="text-sm font-medium">Hayalet Kullanıcı</div>
                            <div className="text-xs text-muted">Aksini seçerseniz e-posta ile aranır</div>
                        </div>
                    </div>
                    <div
                        className={`toggle ${isGhost ? 'active' : ''}`}
                        onClick={() => {
                            setIsGhost(!isGhost);
                            setError('');
                        }}
                    />
                </div>

                <form onSubmit={handleAddMember} className="flex flex-col gap-md">
                    {error && <div className="text-xs text-rose-500 font-medium" style={{ color: 'var(--accent-rose)' }}>{error}</div>}

                    {isGhost ? (
                        <>
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

                            <div className="form-group">
                                <label className="form-label">IBAN (opsiyonel)</label>
                                <input
                                    className="form-input"
                                    placeholder="TR00 0000..."
                                    style={{ fontFamily: 'monospace' }}
                                    value={iban}
                                    onChange={e => setIban(formatIBAN(e.target.value))}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Kullanıcı E-postası *</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="Gerçek kullanıcının e-postası..."
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full" disabled={loading || (isGhost ? !name.trim() : !email.trim())}>
                        <UserPlus size={16} /> {loading ? 'Aranıyor...' : 'Üye Ekle'}
                    </button>
                </form>
            </div>
        </div>
    );
}
