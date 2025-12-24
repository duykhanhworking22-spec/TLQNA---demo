import React, { useState, useEffect } from 'react';
import { Flag, FileText, LayoutDashboard, Briefcase, BookOpen, LogOut } from 'lucide-react';
import './CVHTSidebar.css';
import { useNotification } from '../contexts/NotificationContext';

const AdminSidebar = ({ activePage, onNavigate }) => {
    const { showConfirm } = useNotification();
    const [userData, setUserData] = useState({
        name: "Admin",
        role: "Quản trị viên"
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode JWT
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                setUserData({
                    name: payload.hoTen || payload.sub || "Admin",
                    role: "Quản trị viên"
                });
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        const confirmed = await showConfirm('Bạn có chắc chắn muốn đăng xuất?');
        if (confirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/';
        }
    };

    const navItems = [
        { id: 'admin-reports', icon: Flag, label: 'Quản lý Báo cáo' },
        { id: 'question-bank', icon: FileText, label: 'Ngân hàng câu hỏi' },
        { id: 'faq-management', icon: BookOpen, label: 'Quản lý FAQ' },
        // Add more if needed later
    ];

    return (
        <aside className="cvht-sidebar" style={{ background: '#0f172a' }}>
            <div className="cvht-profile">
                <div className="cvht-avatar">
                    <img
                        src={`https://ui-avatars.com/api/?name=${userData.name}&background=ef4444&color=fff`}
                        alt="Admin"
                    />
                </div>
                <div className="cvht-info">
                    <h3 className="cvht-name" style={{ color: '#e2e8f0' }}>{userData.name}</h3>
                    <p className="cvht-role" style={{ color: '#94a3b8' }}>{userData.role}</p>
                </div>
            </div>

            <nav className="cvht-nav">
                {navItems.map(item => (
                    <a
                        key={item.id}
                        href="#"
                        className={`cvht-nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </a>
                ))}

                <a
                    href="#"
                    className="cvht-nav-item logout"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </a>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
