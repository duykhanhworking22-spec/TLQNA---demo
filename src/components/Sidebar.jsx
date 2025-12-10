import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, PlusCircle, BookOpen, User, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activePage, onNavigate }) => {
    // Default to 'my-question' if undefined
    const current = activePage || 'my-question';

    const [userData, setUserData] = useState({
        name: "Sinh viên",
        role: "Sinh viên"
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT with UTF-8 support
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                setUserData({
                    name: payload.hoTen || payload.name || "Sinh viên",
                    role: "Đại học Thăng Long"
                });
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-area">
                    <MessageSquare className="logo-icon" size={24} />
                    <span className="logo-text">Hệ thống Hỏi đáp</span>
                </div>
            </div>

            <div className="user-profile">
                <div className="avatar">
                    <img src={`https://ui-avatars.com/api/?name=${userData.name.replace(/ /g, '+')}&background=random`} alt="User" />
                </div>
                <div className="user-info">
                    <h3 className="user-name">{userData.name}</h3>
                    <p className="user-role">{userData.role}</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <a
                    href="#"
                    className={`nav-item ${current === 'profile' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                >
                    <User size={20} />
                    <span>Hồ sơ cá nhân</span>
                </a>
                <a
                    href="#"
                    className={`nav-item ${current === 'faq' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('faq'); }}
                >
                    <BookOpen size={20} />
                    <span>Kho kiến thức (FAQ)</span>
                </a>
                <a
                    href="#"
                    className={`nav-item ${current === 'new-question' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('new-question'); }}
                >
                    <PlusCircle size={20} />
                    <span>Tạo câu hỏi mới</span>
                </a>
                <a
                    href="#"
                    className={`nav-item ${current === 'my-question' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('my-question'); }}
                >
                    <MessageSquare size={20} />
                    <span>Câu hỏi của tôi</span>
                </a>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} style={{ marginRight: '0.5rem' }} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
