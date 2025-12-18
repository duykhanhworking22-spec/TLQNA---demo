import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, User, Clock, BookOpen, Layers, Users, Search } from 'lucide-react';
import './QuestionList.css';
import './CVHTQuestions.css';
import api, { questionApi, classApi } from '../services/api';

const PendingQuestions = ({ onNavigate }) => {
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

    useEffect(() => {
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

    const getStatusLabel = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'Chờ duyệt';
            case 'PROCESSING': return 'Đang xử lý';
            case 'ANSWER':
            case 'ANSWERED':
            case '1': return 'Đã trả lời';
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
                                    >
                                        <div className="card-header-flex">
                                            <h3 className="card-title-lg">{q.tieuDe}</h3>
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
        </main>
    );
};

export default PendingQuestions;
