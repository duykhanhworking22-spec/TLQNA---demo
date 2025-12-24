import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, User, Calendar, MessageCircle } from 'lucide-react';
import { questionApi } from '../services/api';
import './QuestionList.css';
import './QuestionBank.css';

const QuestionBank = ({ onNavigate, initialSearch }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState(null); // Track which card is open
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0
    });

    const [filters, setFilters] = useState({
        linhVuc: '', // Was chuDe
        chuyenNganh: '', // Was khoaVien
        khoaHoc: '',
        namHoc: '',
        timeRange: 'TODAY'
    });

    // Update searchTerm if initialSearch prop changes (e.g. navigation from NewQuestion)
    useEffect(() => {
        if (initialSearch !== undefined) {
            setSearchTerm(initialSearch);
            // Also reset filters to ensure global search? Optional but good UX.
            setFilters(prev => ({ ...prev, linhVuc: '', chuyenNganh: '', khoaHoc: '', namHoc: '', timeRange: '' }));
        }
    }, [initialSearch]);

    const fetchQuestions = async (page = 0) => {
        setLoading(true);
        try {
            const params = {
                trangThai: 'ANSWER',
                page: page,
                size: 10
            };

            if (searchTerm) params.keyword = searchTerm;
            if (filters.linhVuc) params.linhVuc = filters.linhVuc;
            if (filters.chuyenNganh) params.chuyenNganh = filters.chuyenNganh; // Send as 'chuyenNganh' for backend filtering
            if (filters.khoaHoc) params.khoaHoc = filters.khoaHoc;
            if (filters.namHoc) params.namHoc = filters.namHoc;

            if (filters.timeRange) {
                const now = new Date();
                let startDate;

                switch (filters.timeRange) {
                    case 'TODAY': {
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    }
                    case 'THIS_WEEK': {
                        const day = now.getDay();
                        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
                        break;
                    }
                    case 'THIS_MONTH': {
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    }
                    case 'THIS_YEAR': {
                        startDate = new Date(now.getFullYear(), 0, 1);
                        break;
                    }
                }

                if (startDate) {
                    params.fromDate = startDate.toISOString().split('T')[0];
                }
            }

            const response = await questionApi.getAll(params);

            if (response.data && response.data.data) {
                const pageData = response.data.data;
                setQuestions(pageData.content || []);
                setPagination({
                    currentPage: pageData.number || 0,
                    totalPages: pageData.totalPages || 0,
                    totalElements: pageData.totalElements || 0
                });
            } else {
                setQuestions([]);
            }
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchQuestions(0);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchQuestions(newPage);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const handleQuestionClick = (questionId) => {
        if (onNavigate) {
            onNavigate('question-detail', { id: questionId });
        }
    };

    const toggleCard = (id) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Kho câu hỏi đã trả lời</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <div className="qbank-header">
                    <h1 className="page-title">Kho câu hỏi</h1>
                    <p className="qbank-subtitle">
                        Khám phá các câu hỏi đã được trả lời để tham khảo
                    </p>
                </div>

                <div className="qbank-search-area">
                    <div className="search-input-wrapper qbank-search">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="qbank-layout">
                    <aside className="qbank-filters">
                        <div className="filter-card">
                            <div className="filter-header">
                                <Filter size={18} />
                                <h3>Bộ lọc tìm kiếm</h3>
                            </div>

                            {/* Field Filter (Prev: Topic) */}
                            <div className="filter-group">
                                <label>Lĩnh vực</label>
                                <select
                                    className="filter-select"
                                    value={filters.linhVuc}
                                    onChange={(e) => handleFilterChange('linhVuc', e.target.value)}
                                >
                                    <option value="">Tất cả lĩnh vực</option>
                                    <option value="Học phí & Tài chính">Học phí & Tài chính</option>
                                    <option value="Đào tạo & Tín chỉ">Đào tạo & Tín chỉ</option>
                                    <option value="Thủ tục hành chính">Thủ tục hành chính</option>
                                    <option value="Hoạt động khác">Hoạt động khác</option>
                                </select>
                            </div>

                            {/* Faculty/Major Filter */}
                            <div className="filter-group">
                                <label>Khoa / Viện</label>
                                <select
                                    className="filter-select"
                                    value={filters.chuyenNganh}
                                    onChange={(e) => handleFilterChange('chuyenNganh', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                                    <option value="Truyền thông đa phương tiện">Truyền thông đa phương tiện</option>
                                    <option value="Luật kinh tế">Luật kinh tế</option>
                                    <option value="Ngôn ngữ anh">Ngôn ngữ Anh</option>
                                    <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
                                </select>
                            </div>

                            {/* Course Filter */}
                            <div className="filter-group">
                                <label>Khóa</label>
                                <select
                                    className="filter-select"
                                    value={filters.khoaHoc}
                                    onChange={(e) => handleFilterChange('khoaHoc', e.target.value)}
                                >
                                    <option value="">Tất cả các khóa</option>
                                    <option value="K33">K33</option>
                                    <option value="K34">K34</option>
                                    <option value="K35">K35</option>
                                    <option value="K36">K36</option>
                                    <option value="K37">K37</option>
                                </select>
                            </div>

                            {/* Academic Year Filter */}
                            <div className="filter-group">
                                <label>Năm học</label>
                                <select
                                    className="filter-select"
                                    value={filters.namHoc}
                                    onChange={(e) => handleFilterChange('namHoc', e.target.value)}
                                >
                                    <option value="">Tất cả năm học</option>
                                    <option value="2025">2025 - 2026</option>
                                    <option value="2024">2024 - 2025</option>
                                </select>
                            </div>

                            {/* Time Range Filter - Button Group */}
                            <div className="filter-group">
                                <label>Thời gian</label>
                                <div className="time-filter-buttons">
                                    <button
                                        className={`time-btn ${filters.timeRange === '' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('timeRange', '')}
                                    >
                                        Tất cả
                                    </button>
                                    <button
                                        className={`time-btn ${filters.timeRange === 'TODAY' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('timeRange', 'TODAY')}
                                    >
                                        Hôm nay
                                    </button>
                                    <button
                                        className={`time-btn ${filters.timeRange === 'THIS_WEEK' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('timeRange', 'THIS_WEEK')}
                                    >
                                        Tuần này
                                    </button>
                                    <button
                                        className={`time-btn ${filters.timeRange === 'THIS_MONTH' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('timeRange', 'THIS_MONTH')}
                                    >
                                        Tháng này
                                    </button>
                                    <button
                                        className={`time-btn ${filters.timeRange === 'THIS_YEAR' ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('timeRange', 'THIS_YEAR')}
                                    >
                                        Năm nay
                                    </button>
                                </div>
                            </div>

                            <button className="btn-apply-filter" onClick={() => fetchQuestions(0)}>
                                Áp dụng bộ lọc
                            </button>
                        </div>
                    </aside>

                    <div className="qbank-list-container">
                        {loading ? (
                            <div className="text-center" style={{ padding: '20px' }}>Đang tải...</div>
                        ) : questions.length === 0 ? (
                            <div className="empty-state">
                                <BookOpen size={48} />
                                <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc</p>
                            </div>
                        ) : (
                            <>
                                <div className="qbank-stats">
                                    <span>Tìm thấy {pagination.totalElements} câu hỏi</span>
                                </div>

                                {questions.map((q) => (
                                    <div key={q.maCauHoi} className={`qbank-card ${openId === q.maCauHoi ? 'expanded' : ''}`}>
                                        <div className="qbank-card-header" onClick={() => toggleCard(q.maCauHoi)}>
                                            <div className="header-left">
                                                <div className="question-id-badge">#{q.maCauHoi}</div>
                                                <h3 className="question-title-full">{q.tieuDe}</h3>
                                            </div>
                                            <div className="question-meta-full">
                                                <span className="meta-item">
                                                    <User size={14} />
                                                    {q.tenSinhVien || q.maSinhVien}
                                                </span>
                                                <span className="meta-dot">•</span>
                                                <span className="meta-item">
                                                    <Calendar size={14} />
                                                    {formatDate(q.ngayGui)}
                                                </span>
                                            </div>
                                        </div>

                                        {openId === q.maCauHoi && (
                                            <>
                                                <div className="question-body">
                                                    <h4 className="section-label">CÂU HỎI:</h4>
                                                    <p className="question-content-text">{q.noiDung}</p>
                                                </div>

                                                {q.answerPreview && (
                                                    <div className="answer-body">
                                                        <h4 className="section-label answer-label">
                                                            <MessageCircle size={16} />
                                                            CÂU TRẢ LỜI
                                                            {q.nguoiTraLoi && <span className="answerer-name"> - {q.nguoiTraLoi}</span>}
                                                        </h4>
                                                        <p className="answer-content-text">{q.answerPreview}</p>
                                                    </div>
                                                )}

                                                <div className="card-footer">
                                                    <button
                                                        className="btn-view-detail-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleQuestionClick(q.maCauHoi);
                                                        }}
                                                    >
                                                        Xem chi tiết đầy đủ →
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 0}
                                        >
                                            ‹ Trước
                                        </button>

                                        <div className="page-numbers">
                                            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i;
                                                } else if (pagination.currentPage < 3) {
                                                    pageNum = i;
                                                } else if (pagination.currentPage >= pagination.totalPages - 3) {
                                                    pageNum = pagination.totalPages - 5 + i;
                                                } else {
                                                    pageNum = pagination.currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        className={`page-number ${pageNum === pagination.currentPage ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            className="page-btn"
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                                        >
                                            Sau ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default QuestionBank;
