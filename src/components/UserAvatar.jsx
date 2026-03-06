import { Ghost } from 'lucide-react';
import { getAvatarImage } from '../utils/helpers';

export default function UserAvatar({ member, className = 'avatar', style = {}, title, iconSize = 16 }) {
    if (!member) return null;

    if (member.isGhost) {
        return (
            <div
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-tertiary)',
                    border: '1px dashed var(--border-secondary)',
                    color: 'var(--text-secondary)',
                    borderRadius: '50%',
                    ...style
                }}
                title={title || member.name}
            >
                <Ghost size={iconSize} />
            </div>
        );
    }

    return (
        <img
            src={getAvatarImage(member.avatarId || 1)}
            alt={member.name}
            className={className}
            style={{ objectFit: 'cover', ...style }}
            title={title || member.name}
        />
    );
}
