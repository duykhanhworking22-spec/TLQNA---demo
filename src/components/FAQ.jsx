import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, BookOpen, HelpCircle, Filter, Calendar as CalendarIcon } from 'lucide-react';
import './QuestionList.css'; // Common styles
import './FAQ.css';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openId, setOpenId] = useState(1);

    // Filter states
    const [filters, setFilters] = useState({
        course: '',
        class: '',
        tag: '',
        subject: '',
        time: 'all' // all, today, week, month, custom
    });

    const faqs = [
        {
            id: 1,
            question: "Bao giờ có lịch đăng ký học kỳ 2 nhóm 1?",
            answer: "Chào em, dự kiến lịch đăng ký tín chỉ học kỳ 2 nhóm 1 sẽ bắt đầu vào ngày 01/03/2026. Lịch cụ thể từng ca sẽ được thông báo trên cổng thông tin sinh viên trước 1 tuần nhé.",
            category: "Đăng ký tín chỉ",
            course: "K35",
            class: "Tất cả",
            subject: "Tín chỉ",
            answeredBy: "CVHT Nguyễn Thị Lan",
            lastUpdate: "07/12/2025"
        },
        {
            id: 2,
            question: "Điều kiện để nhận học bổng khuyến khích học tập là gì?",
            answer: "Để nhận học bổng KKHT, sinh viên cần đạt GPA học kỳ từ 3.2 trở lên (đối với loại Giỏi) hoặc 3.6 trở lên (Xuất sắc), điểm rèn luyện từ 80 trở lên và không có môn nào thi lại trong kỳ xét.",
            category: "Học bổng",
            course: "Tất cả",
            class: "Tất cả",
            subject: "Công tác sinh viên",
            answeredBy: "Phòng CTSV",
            lastUpdate: "01/10/2024"
        },
        {
            id: 4,
            question: "Điều kiện xếp hạng tốt nghiệp (Xuất sắc, Giỏi...) của Trường là gì?",
            answer: (
                <div>
                    <p>Sinh viên tốt nghiệp được xếp hạng theo Điểm trung bình tích lũy (TBTL) toàn khóa học như sau:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                        <li><strong>Xuất sắc:</strong> TBTL ≥ 9,0</li>
                        <li><strong>Giỏi:</strong> 8,0 ≤ TBTL &lt; 9,0</li>
                        <li><strong>Khá:</strong> 7,0 ≤ TBTL &lt; 8,0</li>
                        <li><strong>Trung bình khá:</strong> 6,0 ≤ TBTL &lt; 7,0</li>
                        <li><strong>Trung bình:</strong> 5,0 ≤ TBTL &lt; 6,0</li>
                    </ul>
                    <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.95rem', color: '#64748b' }}>
                        * Lưu ý: Hạng tốt nghiệp của những sinh viên có điểm TBTL đạt loại xuất sắc hoặc giỏi sẽ bị giảm đi một mức nếu khối lượng các học phần học lại vượt quá 5% so với tổng số tín chỉ quy định cho toàn chương trình hoặc sinh viên đã bị kỷ luật từ mức cảnh cáo trở lên trong thời gian học.
                    </p>
                </div>
            ),
            category: "Quy chế Đào tạo",
            course: "Tất cả",
            class: "Tất cả",
            subject: "Quy chế",
            answeredBy: "Phòng Đào tạo",
            lastUpdate: "07/12/2025"
        },
        {
            id: 3,
            question: "Em quên mật khẩu tài khoản sinh viên thì lấy lại như thế nào?",
            answer: "Em vui lòng mang thẻ sinh viên lên phòng Eduroam (Tầng 2 nhà B) để được các thầy cô hỗ trợ cấp lại mật khẩu mới nhé.",
            category: "Tài khoản",
            course: "Tất cả",
            class: "Tất cả",
            subject: "CNTT",
            answeredBy: "Trung tâm CNTT",
            lastUpdate: "15/09/2024"
        }
    ];

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Kho kiến thức (FAQ)</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <div className="faq-header">
                    <h1 className="page-title">Câu hỏi thường gặp</h1>
                </div>

                <div className="faq-search-area">
                    <div className="search-input-wrapper faq-search">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Nhập từ khóa để tìm kiếm..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="faq-layout">
                    {/* Left Sidebar Filters */}
                    <aside className="faq-filters">
                        <div className="filter-card">
                            <div className="filter-header">
                                <Filter size={18} />
                                <h3>Bộ lọc tìm kiếm</h3>
                            </div>

                            {/* Theo Khóa */}
                            <div className="filter-group">
                                <label>Theo Khóa</label>
                                <select
                                    className="filter-select"
                                    value={filters.course}
                                    onChange={(e) => handleFilterChange('course', e.target.value)}
                                >
                                    <option value="">Tất cả các khóa</option>
                                    <option value="K33">K33</option>
                                    <option value="K34">K34</option>
                                    <option value="K35">K35</option>
                                    <option value="K36">K36</option>
                                </select>
                            </div>

                            {/* Theo Lớp */}
                            <div className="filter-group">
                                <label>Theo Lớp</label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    placeholder="Nhập mã lớp..."
                                    value={filters.class}
                                    onChange={(e) => handleFilterChange('class', e.target.value)}
                                />
                            </div>

                            {/* Theo Tag */}
                            <div className="filter-group">
                                <label>Theo Tag</label>
                                <select
                                    className="filter-select"
                                    value={filters.tag}
                                    onChange={(e) => handleFilterChange('tag', e.target.value)}
                                >
                                    <option value="">Tất cả tags</option>
                                    <option value="tin-chi">Đăng ký tín chỉ</option>
                                    <option value="hoc-bong">Học bổng</option>
                                    <option value="tai-khoan">Tài khoản</option>
                                    <option value="hoc-phi">Học phí</option>
                                </select>
                            </div>

                            {/* Theo Môn */}
                            <div className="filter-group">
                                <label>Theo Môn</label>
                                <select
                                    className="filter-select"
                                    value={filters.subject}
                                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                                >
                                    <option value="">Tất cả các môn</option>
                                    <option value="csdl">Cơ sở dữ liệu</option>
                                    <option value="ctdl">Cấu trúc dữ liệu</option>
                                    <option value="mmt">Mạng máy tính</option>
                                </select>
                            </div>

                            {/* Theo Thời gian */}
                            <div className="filter-group">
                                <label>Theo Thời gian</label>
                                <div className="time-filters">
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="time"
                                            checked={filters.time === 'today'}
                                            onChange={() => handleFilterChange('time', 'today')}
                                        />
                                        <span className="radio-checkmark"></span>
                                        Hôm nay
                                    </label>
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="time"
                                            checked={filters.time === 'week'}
                                            onChange={() => handleFilterChange('time', 'week')}
                                        />
                                        <span className="radio-checkmark"></span>
                                        Tuần này
                                    </label>
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="time"
                                            checked={filters.time === 'month'}
                                            onChange={() => handleFilterChange('time', 'month')}
                                        />
                                        <span className="radio-checkmark"></span>
                                        Tháng này
                                    </label>
                                    <label className="radio-container">
                                        <input
                                            type="radio"
                                            name="time"
                                            checked={filters.time === 'custom'}
                                            onChange={() => handleFilterChange('time', 'custom')}
                                        />
                                        <span className="radio-checkmark"></span>
                                        Tùy chọn thời gian
                                    </label>
                                </div>
                                {filters.time === 'custom' && (
                                    <div className="custom-date-inputs">
                                        <input type="date" className="date-input" />
                                        <span>-</span>
                                        <input type="date" className="date-input" />
                                    </div>
                                )}
                            </div>

                            <button className="btn-apply-filter">Áp dụng bộ lọc</button>
                        </div>
                    </aside>

                    {/* FAQ List */}
                    <div className="faq-list-container">
                        {faqs.map((faq) => (
                            <div key={faq.id} className={`faq-item ${openId === faq.id ? 'open' : ''}`}>
                                <div className="faq-question" onClick={() => toggleFAQ(faq.id)}>
                                    <div className="question-content">
                                        <HelpCircle size={20} className="q-icon" />
                                        <span className="q-text">{faq.question}</span>
                                    </div>
                                    <span className="toggle-icon">
                                        {openId === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </span>
                                </div>

                                {openId === faq.id && (
                                    <div className="faq-answer">
                                        <div className="answer-box">
                                            <div style={{ lineHeight: '1.6' }}>{faq.answer}</div>
                                            <div className="answer-meta">
                                                <div className="meta-left">
                                                    <span className="meta-tag">{faq.category}</span>
                                                    <span className="meta-dot">•</span>
                                                    <span className="meta-time">{faq.lastUpdate}</span>
                                                </div>
                                                <span className="meta-author">Trả lời bởi: <strong>{faq.answeredBy}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default FAQ;
