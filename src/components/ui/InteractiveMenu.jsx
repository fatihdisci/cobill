import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, Users, ArrowLeftRight, BarChart3, CircleUser } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const defaultItems = [
    { label: 'nav.wallet', icon: Wallet, to: '/wallet' },
    { label: 'nav.groups', icon: Users, to: '/groups' },
    { label: 'nav.settlements', icon: ArrowLeftRight, to: '/settlements' },
    { label: 'nav.reports', icon: BarChart3, to: '/reports' },
    { label: 'nav.profile', icon: CircleUser, to: '/profile' },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu = ({ items, accentColor }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const finalItems = useMemo(() => {
        const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
        if (!isValid) {
            console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
            return defaultItems;
        }
        return items;
    }, [items]);

    const getActiveIndex = () => {
        const index = finalItems.findIndex(item => {
            if (item.to === '/groups' && location.pathname.startsWith('/group')) return true;
            if (location.pathname === item.to) return true;
            if (item.to !== '/' && location.pathname.startsWith(item.to)) return true;
            return false;
        });
        return index !== -1 ? index : 0;
    };

    const [activeIndex, setActiveIndex] = useState(getActiveIndex());

    useEffect(() => {
        const newIdx = getActiveIndex();
        if (newIdx !== activeIndex) setActiveIndex(newIdx);
    }, [location.pathname, finalItems]);

    useEffect(() => {
        if (activeIndex >= finalItems.length) {
            setActiveIndex(0);
        }
    }, [finalItems, activeIndex]);

    const textRefs = useRef([]);
    const itemRefs = useRef([]);

    useEffect(() => {
        const setLineWidth = () => {
            const activeItemElement = itemRefs.current[activeIndex];
            const activeTextElement = textRefs.current[activeIndex];

            if (activeItemElement && activeTextElement) {
                const textWidth = activeTextElement.offsetWidth;
                activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
            }
        };

        setLineWidth();

        window.addEventListener('resize', setLineWidth);
        return () => {
            window.removeEventListener('resize', setLineWidth);
        };
    }, [activeIndex, finalItems]);

    const handleItemClick = (index) => {
        setActiveIndex(index);
        navigate(finalItems[index].to);
    };

    const navStyle = useMemo(() => {
        const activeColor = accentColor || defaultAccentColor;
        return { '--component-active-color': activeColor };
    }, [accentColor]);

    return (
        <nav
            className="menu"
            role="navigation"
            style={navStyle}
        >
            {finalItems.map((item, index) => {
                const isActive = index === activeIndex;
                const isTextActive = isActive;

                const IconComponent = item.icon;

                return (
                    <button
                        key={item.label}
                        className={`menu__item ${isActive ? 'active' : ''}`}
                        onClick={() => handleItemClick(index)}
                        ref={(el) => (itemRefs.current[index] = el)}
                        style={{ '--lineWidth': '0px' }}
                    >
                        <div className="menu__icon">
                            <IconComponent className="icon" />
                        </div>
                        <strong
                            className={`menu__text ${isTextActive ? 'active' : ''}`}
                            ref={(el) => (textRefs.current[index] = el)}
                        >
                            {t(item.label)}
                        </strong>
                    </button>
                );
            })}
        </nav>
    );
};

export { InteractiveMenu };
export default InteractiveMenu;
