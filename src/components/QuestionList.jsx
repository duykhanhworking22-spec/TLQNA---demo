import React, { useEffect, useState } from 'react';
import { Search, Plus, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import './QuestionList.css';
import api from '../services/api';

const QuestionList = ({ onNavigate }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchQuestions();
    }, [page]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            // Note: Currently fetching all questions. If filtering by student is needed, 
            // the backend might filter by token or we need to pass 'maSv' if we knew it.
            const response = await api.get('/questions', {
                params: {
                    page: page,
                    size: 10,
                    sort: 'ngayGui,desc' // heuristic
                }
            });
            if (response.data && response.data.data) {
                const pageData = response.data.data;
                setQuestions(pageData.content || []);
                setTotalPages(pageData.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'pending'; // Đang chờ
            case 'PROCESSING': return 'processing'; // Đang xử lý
            case 'ANSWER':
            case 'ANSWERED':
            case 'COMPLETED':
            case '1': return 'completed'; // Đã trả lời/Xong
            case 'REJECTED': return 'rejected';
            default: return '';
        }
    };

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'Đang chờ';
            case 'PROCESSING': return 'Đang xử lý';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return 'Đã trả lời';
            case 'COMPLETED': return 'Hoàn thành';
            case 'REJECTED': return 'Từ chối';
            default: return status;
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-right">
                    <button className="icon-btn"><Search size={20} /></button>
                    <button className="icon-btn"><Bell size={20} /><span className="badge">1</span></button>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Danh sách Câu hỏi</h1>

                <div className="controls-area">
                    <button
                        className="btn-primary"
                        onClick={() => onNavigate && onNavigate('new-question')}
                    >
                        <Plus size={18} style={{ marginRight: '0.5rem' }} />
                        Đặt câu hỏi mới
                    </button>

                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Tìm kiếm..." className="search-input" />
                    </div>
                </div>

                <div className="table-card">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải dữ liệu...</div>
                    ) : (
                        <table className="questions-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Chủ đề</th>
                                    <th>Ngày gửi</th>
                                    <th>Cập nhật cuối</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có câu hỏi nào.</td></tr>
                                ) : (
                                    questions.map((q, index) => (
                                        <tr
                                            key={q.maCauHoi}
                                            onClick={() => onNavigate('question-detail', { id: q.maCauHoi })}
                                            style={{ cursor: 'pointer' }}
                                            className="question-row"
                                        >
                                            <td>{index + 1 + (page * 10)}</td>
                                            <td className="subject-cell">{q.tieuDe}</td>
                                            <td className="date-cell">{formatDate(q.ngayGui)}</td>
                                            <td className="update-cell">{formatDate(q.ngayCapNhatCuoi || q.ngayGui)}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(q.trangThai)}`}>
                                                    {getStatusLabel(q.trangThai)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    <div className="pagination">
                        <div className="pagination-controls">
                            <button
                                className="page-btn"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ margin: '0 10px', fontSize: '14px' }}>Trang {page + 1} / {totalPages || 1}</span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default QuestionList;
