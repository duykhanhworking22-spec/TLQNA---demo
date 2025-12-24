import React, { useState, useEffect } from 'react';
import { Flag, Trash2, CheckCircle, Search, LayoutDashboard, Users, MessageSquare, Eye, X } from 'lucide-react';
import './QuestionList.css';
import './CVHTDashboard.css';
import api, { questionApi } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
// Reuse CVHT styles for consistency

const AdminReports = () => {
    const { showNotification } = useNotification();
    const [reportedQuestions, setReportedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    useEffect(() => {
        fetchReportedQuestions();
    }, []);

    const fetchReportedQuestions = async () => {
        setLoading(true);
        try {
            // Re-using getAll API but listing all reported questions
            // In a real app, you might want a specialized admin endpoint
            const response = await questionApi.getAll({
                status: 'REPORTED',
                size: 50,
                sort: 'ngayCapNhatCuoi,desc'
            });
            if (response.data && response.data.data) {
                setReportedQuestions(response.data.data.content || []);
            }
        } catch (error) {
            console.error("Failed to fetch reported questions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
            try {
                // Using existing delete endpoint
                await api.delete(`/questions/${id}`);
                showNotification('Đã xóa câu hỏi vi phạm', 'success');
                fetchReportedQuestions();
                setViewModalOpen(false);
            } catch (error) {
                console.error("Delete failed", error);
                showNotification('Xóa thất bại', 'error');
            }
        }
    };

    const handleDismissReport = async (id) => {
        try {
            alert("Tính năng 'Bỏ qua báo cáo' sẽ được cập nhật sau.");
        } catch (error) {
            console.error(error);
        }
    };

    const handleView = (question) => {
        setSelectedQuestion(question);
        setViewModalOpen(true);
    };

    return (
        <main className="main-content">
            <header className="top-bar" style={{ background: '#1e293b' }}> {/* Darker header for Admin */}
                <div className="top-bar-left">
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LayoutDashboard size={24} color="#60a5fa" />
                        Admin Dashboard
                    </span>
                </div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Administrator</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Flag size={28} /> Quản lý Báo cáo Vi phạm
                </h1>

                <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                    <div className="dashboard-bottom" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="stats-card text-center" style={{ borderLeft: '4px solid #ef4444' }}>
                            <span className="stat-label">Câu hỏi bị báo cáo</span>
                            <div className="stat-number" style={{ color: '#ef4444' }}>{reportedQuestions.length}</div>
                        </div>
                    </div>
                </div>

                <div className="search-input-wrapper" style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <Search className="search-icon" size={18} />
                    <input type="text" className="search-input" placeholder="Tìm kiếm trong báo cáo..." />
                </div>

                <div className="table-card">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th>Người báo cáo</th>
                                    <th>Lý do</th>
                                    <th>Câu hỏi bị báo cáo</th>
                                    <th>Ngày báo cáo</th>
                                    <th style={{ textAlign: 'right' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportedQuestions.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Không có báo cáo nào cần xử lý.</td></tr>
                                ) : (
                                    reportedQuestions.map((q) => (
                                        <tr key={q.maCauHoi}>
                                            <td style={{ fontWeight: 500 }}>{q.nguoBaoCao || 'Ẩn danh'}</td>
                                            <td style={{ color: '#ef4444', fontWeight: 500 }}>{q.lyDoBaoCao || 'Nội dung không phù hợp'}</td>
                                            <td style={{ maxWidth: '400px' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{q.tieuDe}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {q.noiDung}
                                                </div>
                                            </td>
                                            <td>{new Date(q.ngayCapNhatCuoi || q.ngayGui).toLocaleDateString('vi-VN')}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => handleView(q)}
                                                        title="Xem chi tiết"
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                    >
                                                        <Eye size={16} /> Xem
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        onClick={() => handleDismissReport(q.maCauHoi)}
                                                        title="Bỏ qua báo cáo"
                                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                    >
                                                        <CheckCircle size={16} /> Bỏ qua
                                                    </button>
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleDelete(q.maCauHoi)}
                                                        title="Xóa vĩnh viễn"
                                                        style={{ background: '#ef4444', padding: '6px 12px', fontSize: '0.8rem' }}
                                                    >
                                                        <Trash2 size={16} /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* View Detail Modal */}
            {viewModalOpen && selectedQuestion && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Flag size={24} /> Chi tiết Báo cáo
                            </h2>
                            <button onClick={() => setViewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                Lý do báo cáo
                            </label>
                            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                                {selectedQuestion.lyDoBaoCao || 'Không có lý do cụ thể'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                Người gửi câu hỏi
                            </label>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={16} color="#64748b" />
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Họ tên:</span>
                                        <span>{selectedQuestion.tenSinhVien}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Mã SV:</span> {selectedQuestion.maSinhVien}
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Lớp:</span> {selectedQuestion.maLop || 'N/A'}
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Khóa:</span> {selectedQuestion.khoaHoc || 'N/A'}
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>Khoa/Viện:</span> {selectedQuestion.chuyenNganh || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' }}>
                                Nội dung câu hỏi
                            </label>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{selectedQuestion.tieuDe}</h3>
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                                {selectedQuestion.noiDung}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="btn-secondary"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => handleDelete(selectedQuestion.maCauHoi)}
                                className="btn-primary"
                                style={{ background: '#ef4444' }}
                            >
                                <Trash2 size={16} style={{ marginRight: '6px' }} />
                                Xóa câu hỏi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminReports;
