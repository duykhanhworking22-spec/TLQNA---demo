import React from 'react';
import { Home, PlusCircle, Book, User, Menu } from 'lucide-react';
import './MobileNavbar.css';

const MobileNavbar = ({ activePage, onNavigate, userRole }) => {

    // Define navigation items based on role
    const getNavItems = () => {
        if (userRole === 'cvht') {
            return [
                { id: 'pending', icon: <Home size={24} />, label: 'Chờ xử lý' },
                { id: 'processing', icon: <Book size={24} />, label: 'Đang xử lý' },
                { id: 'knowledge', icon: <Book size={24} />, label: 'Kiến thức' },
                { id: 'profile', icon: <User size={24} />, label: 'Cá nhân' }
            ];
        } else if (userRole === 'admin') {
            return [
                { id: 'admin-reports', icon: <Home size={24} />, label: 'Báo cáo' },
                // Add more admin items if needed
            ];
        } else {
            // Student
            return [
                { id: 'my-question', icon: <Home size={24} />, label: 'Trang chủ' },
                { id: 'new-question', icon: <PlusCircle size={24} />, label: 'Hỏi đáp' },
                { id: 'question-bank', icon: <Book size={24} />, label: 'Kho tin' },
                { id: 'profile', icon: <User size={24} />, label: 'Cá nhân' }
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <nav className="mobile-navbar">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                >
                    <div className="nav-icon">
                        {item.icon}
                    </div>
                    <span className="nav-label">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default MobileNavbar;
