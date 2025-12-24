import React from 'react';
import { Home, PlusCircle, Book, User, LogOut, BarChart2, BookOpen, FileText, CheckCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import './MobileNavbar.css';

const MobileNavbar = ({ activePage, onNavigate, userRole }) => {
    const { showConfirm } = useNotification();

    const handleLogout = async () => {
        const confirmed = await showConfirm('Bạn có chắc chắn muốn đăng xuất?');
        if (confirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('currentPage');
            localStorage.removeItem('previousPage');
            localStorage.removeItem('selectedQuestionId');
            localStorage.removeItem('navigationParams');
            window.location.href = '/';
        }
    };

    // Define navigation items based on role
    const getNavItems = () => {
        const commonItems = [];

        if (userRole === 'cvht') {
            commonItems.push(
                { id: 'pending', icon: <FileText size={20} />, label: 'Câu hỏi' },
                { id: 'processing', icon: <CheckCircle size={20} />, label: 'Lịch sử' },
                { id: 'knowledge', icon: <BookOpen size={20} />, label: 'FAQ' },
                { id: 'reports', icon: <BarChart2 size={20} />, label: 'Báo cáo' },
                { id: 'profile', icon: <User size={20} />, label: 'Cá nhân' }
            );
        } else if (userRole === 'admin') {
            commonItems.push(
                { id: 'admin-reports', icon: <BarChart2 size={20} />, label: 'Báo cáo' },
                { id: 'question-bank', icon: <FileText size={20} />, label: 'Câu hỏi' },
                { id: 'faq-management', icon: <BookOpen size={20} />, label: 'FAQ' },
                { id: 'profile', icon: <User size={20} />, label: 'Cá nhân' }
            );
        } else {
            // Student
            commonItems.push(
                { id: 'my-question', icon: <Home size={20} />, label: 'Trang chủ' },
                { id: 'new-question', icon: <PlusCircle size={20} />, label: 'Hỏi đáp' },
                { id: 'question-bank', icon: <Book size={20} />, label: 'Kho tin' },
                { id: 'profile', icon: <User size={20} />, label: 'Cá nhân' }
            );
        }

        return commonItems;
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

            <button
                className="mobile-nav-item logout-btn-mobile"
                onClick={handleLogout}
            >
                <div className="nav-icon">
                    <LogOut size={24} />
                </div>
                <span className="nav-label">Đăng xuất</span>
            </button>
        </nav>
    );
};

export default MobileNavbar;
