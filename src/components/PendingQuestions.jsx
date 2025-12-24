import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, User, Clock, BookOpen, Layers, Users, Search, Flag, X } from 'lucide-react';
import './QuestionList.css';
import './CVHTQuestions.css';
import api, { questionApi, classApi } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const PendingQuestions = ({ onNavigate }) => {
    const { showNotification } = useNotification();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');
    const [majorFilter, setMajorFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('2025');
    const [keyword, setKeyword] = useState('');

    // Data for dropdowns
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [majors, setMajors] = useState([]);

    // Reporting State
    const [reportingQuestionId, setReportingQuestionId] = useState(null);
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [classRes, cohortRes, majorRes] = await Promise.all([
                    classApi.getAll(),
                    classApi.getCohorts(),
                    classApi.getMajors()
                ]);

                if (classRes.data && classRes.data.data) setClasses(classRes.data.data);
                if (cohortRes.data && cohortRes.data.data) setCohorts(cohortRes.data.data);
                if (majorRes.data && majorRes.data.data) setMajors(majorRes.data.data);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                size: 10,
                sort: 'ngayGui,desc',
                maLop: classFilter,
                khoaHoc: cohortFilter,
                chuyenNganh: majorFilter,
                keyword: keyword
            };

            if (yearFilter) {
                params.fromDate = `${yearFilter}-01-01`;
                params.toDate = `${yearFilter}-12-31`;
            }

            if (statusFilter !== 'ALL') {
                params.status = statusFilter;
            }

            const response = await questionApi.getAll(params);
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

    useEffect(() => {
        // Debounce fetch
        const timeoutId = setTimeout(() => {
            fetchQuestions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [page, statusFilter, classFilter, cohortFilter, majorFilter, yearFilter, keyword]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleView = (id) => {
        onNavigate('question-detail', { id });
    };

    const handleReportClick = (e, id) => {
        e.stopPropagation();
        setReportingQuestionId(id);
        setReportReason('');
    };

    const submitReport = async () => {
        if (!reportReason.trim()) {
            showNotification('Vui lòng nhập lý do báo cáo', 'warning');
            return;
        }

        try {
            await questionApi.report(reportingQuestionId, reportReason);
            showNotification('Đã gửi báo cáo lên Admin', 'success');
            setReportingQuestionId(null);
            fetchQuestions(); // Refresh list to update status
        } catch (error) {
            console.error("Report failed", error);
            showNotification('Báo cáo thất bại. Vui lòng thử lại.', 'error');
        }
    };

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'Chờ duyệt';
            case 'PROCESSING': return 'Đang xử lý';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return 'Đã trả lời';
            case 'REPORTED':
            case '2': return 'Đã báo cáo';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return '#f59e0b';
            case 'PROCESSING': return '#3b82f6';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return '#10b981';
            case 'REPORTED':
            case '2': return '#ef4444';
            default: return '#64748b';
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Danh sách câu hỏi</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Danh sách câu hỏi</h1>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-group">
                        <label className="filter-label">Chuyên Ngành</label>
                        <select
                            className="filter-input"
                            value={majorFilter}
                            onChange={(e) => { setMajorFilter(e.target.value); setPage(0); }}
                        >
                            <option value="">Tất cả ngành</option>
                            {Array.isArray(majors) && majors.map((m, index) => (
                                <option key={index} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Khóa</label>
                        <select
                            className="filter-input"
                            value={cohortFilter}
                            onChange={(e) => { setCohortFilter(e.target.value); setPage(0); }}
                        >
                            <option value="">Tất cả khóa</option>
                            {Array.isArray(cohorts) && cohorts.map((c, index) => (
                                <option key={index} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Lớp</label>
                        <select
                            className="filter-input"
                            value={classFilter}
                            onChange={(e) => { setClassFilter(e.target.value); setPage(0); }}
                        >
                            <option value="">Tất cả lớp</option>
                            {Array.isArray(classes) && classes.map((c, index) => (
                                <option key={index} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Năm</label>
                        <select
                            className="filter-input"
                            value={yearFilter}
                            onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
                        >
                            <option value="">Tất cả</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>

                    <div className="filter-group search-group" style={{ flex: 1, minWidth: '250px' }}>
                        <label className="filter-label" style={{ visibility: 'hidden' }}>Tìm kiếm</label>
                        <div className="search-input-wrapper" style={{ width: '100%' }}>
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                className="search-input"
                                value={keyword}
                                onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                            />
                        </div>
                    </div>
                </div>

                {loading ? <p style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</p> : (
                    <>
                        <div className="questions-list">
                            {questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    Không có câu hỏi nào phù hợp với bộ lọc.
                                </div>
                            ) : (
                                questions.map((q) => (
                                    <div
                                        key={q.maCauHoi}
                                        className="question-card-horizontal"
                                        onClick={() => handleView(q.maCauHoi)}
                                        style={{ position: 'relative' }}
                                    >
                                        <div className="card-header-flex">
                                            <h3 className="card-title-lg">{q.tieuDe}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="card-status-badge" style={{
                                                    background: getStatusColor(q.trangThai),
                                                    color: '#fff',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {getStatusLabel(q.trangThai)}
                                                </div>

                                                {/* Report Button */}
                                                {(q.trangThai === 'PENDING' || q.trangThai === '0') && (
                                                    <button
                                                        className="action-icon-btn report-btn"
                                                        onClick={(e) => handleReportClick(e, q.maCauHoi)}
                                                        title="Báo cáo vi phạm"
                                                        style={{
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                            color: '#94a3b8', padding: '4px',
                                                            display: 'flex', alignItems: 'center'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                        onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                                    >
                                                        <Flag size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-details-grid">
                                            <div className="detail-row">
                                                <User size={14} />
                                                <span>{q.tenSinhVien || q.maSinhVien}</span>
                                            </div>
                                            <div className="detail-row">
                                                <Clock size={14} />
                                                <span>{formatDate(q.ngayGui)}</span>
                                            </div>
                                            <div className="detail-row highlight">
                                                <Users size={14} />
                                                <span>{q.maLop || 'Chưa có lớp'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <Layers size={14} />
                                                <span>{q.khoaHoc || 'Chưa có khóa'}</span>
                                            </div>
                                            <div className="detail-row">
                                                <BookOpen size={14} />
                                                <span>{q.chuyenNganh || 'Chưa có ngành'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pagination" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                className="page-btn"
                                disabled={page === 0}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '14px', alignSelf: 'center' }}>Trang {page + 1} / {totalPages || 1}</span>
                            <button
                                className="page-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Report Modal */}
            {reportingQuestionId && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '24px', borderRadius: '12px',
                        width: '400px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Flag size={20} /> Báo cáo vi phạm
                            </h3>
                            <button onClick={() => setReportingQuestionId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>

                        <p style={{ marginBottom: '12px', color: '#475569', fontSize: '0.95rem' }}>
                            Vui lòng nhập lý do báo cáo câu hỏi này lên Admin:
                        </p>

                        <textarea
                            style={{
                                width: '100%', height: '100px', padding: '12px',
                                border: '1px solid #cbd5e1', borderRadius: '8px',
                                marginBottom: '20px', resize: 'none', fontSize: '0.9rem'
                            }}
                            placeholder="Ví dụ: Nội dung không phù hợp, ngôn từ xúc phạm..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setReportingQuestionId(null)}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    color: '#64748b', cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={submitReport}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px',
                                    border: 'none', background: '#ef4444',
                                    color: 'white', cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                Gửi báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default PendingQuestions;
