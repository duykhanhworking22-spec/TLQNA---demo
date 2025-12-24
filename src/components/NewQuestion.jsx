import React, { useState, useEffect } from 'react';
import api, { userApi, questionApi } from '../services/api';
import { Send, Paperclip, X, Sparkles, Loader, ChevronRight, Lightbulb } from 'lucide-react';
import './QuestionList.css'; // Common styles
import './NewQuestion.css';
import { useNotification } from '../contexts/NotificationContext';

const NewQuestion = ({ onNavigate }) => { // Accept onNavigate prop
    const { showNotification } = useNotification();
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('HOCTAP'); // Default domain/field
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cvhtInfo, setCvhtInfo] = useState('');

    // Topic Auto-complete States
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);

    // AI Suggestion States
    const [suggestions, setSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    React.useEffect(() => {
        // Fetch current user profile to get CVHT info via the new API
        userApi.getProfile()
            .then(res => {
                if (res.data && res.data.data) {
                    const u = res.data.data;
                    if (u.cvhtHoTen) {
                        setCvhtInfo(`${u.cvhtMa || 'N/A'} - ${u.cvhtHoTen}`);
                    } else {
                        setCvhtInfo('Chưa có Cố vấn học tập');
                    }
                }
            })
            .catch(err => console.error("Error fetching profile", err));
    }, []);

    // Unified Dynamic Suggestion Logic
    useEffect(() => {
        const analyzeInput = async () => {
            if (title.trim().length < 2) {
                setSuggestions([]);
                setFilteredTopics([]);
                setShowSuggestions(false);
                setShowTopicSuggestions(false);
                return;
            }

            setIsAnalyzing(true);
            try {
                // Fetch dynamic data from backend (answered questions only)
                const params = {
                    keyword: title,
                    status: 'ANSWER',
                    size: 5 // Fetch up to 5 items to populate suggestions
                };

                // Note: Removed 'department' filtering to ensure GLOBAL search for suggestions.
                // We want to suggest topics regardless of the currently selected department in the form.

                const response = await questionApi.getAll(params);

                if (response.data && response.data.data && response.data.data.content) {
                    const foundQuestions = response.data.data.content;

                    // 1. Populate "Similar Questions" (Blue section - for reading answers)
                    setSuggestions(foundQuestions);
                    setShowSuggestions(foundQuestions.length > 0);

                    // 2. Populate "Topic Suggestions" (Green section - for auto-complete)
                    // Extract unique titles from the found questions
                    const uniqueTitles = [...new Set(foundQuestions.map(q => q.tieuDe))];
                    // Filter out titles that are identical to what user typed (no need to suggest what they already wrote)
                    const usefulTitles = uniqueTitles.filter(t => t.trim().toLowerCase() !== title.trim().toLowerCase());

                    setFilteredTopics(usefulTitles);
                    setShowTopicSuggestions(usefulTitles.length > 0);
                } else {
                    setSuggestions([]);
                    setFilteredTopics([]);
                    setShowSuggestions(false);
                    setShowTopicSuggestions(false);
                }
            } catch (error) {
                console.error("Analysis failed:", error);
            } finally {
                setIsAnalyzing(false);
            }
        };

        const timeoutId = setTimeout(analyzeInput, 500);
        return () => clearTimeout(timeoutId);
    }, [title]); // Removed 'department' dependency as it's no longer used in search

    const handleTopicSelect = (topic) => {
        // Redirect to Question Bank with this topic as search term
        if (onNavigate) {
            onNavigate('question-bank', { search: topic });
        }
    };

    const handleSuggestionClick = (questionId) => {
        if (onNavigate) {
            onNavigate('question-detail', { id: questionId });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            showNotification('Vui lòng nhập đầy đủ tiêu đề và nội dung.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('tieuDe', title);
            formData.append('noiDung', content);
            formData.append('linhVuc', department);
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await questionApi.create(formData);

            if (response.data && response.data.status === 200) {
                showNotification('Gửi câu hỏi thành công!', 'success');
                // Reset form
                setTitle('');
                setContent('');
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Lỗi khi gửi câu hỏi:', error);
            const errorMessage = error.response?.data?.message || 'Gửi thất bại. Vui lòng thử lại.';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Tạo câu hỏi mới</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <h1 className="page-title">Gửi câu hỏi mới</h1>

                <div className="form-card">
                    <div className="form-group relative-container">
                        <label htmlFor="title">Chủ đề câu hỏi <span className="highlight">*</span></label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                id="title"
                                className="form-input"
                                placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoComplete="off"
                            />
                            {isAnalyzing && <Loader className="input-loader spin" size={18} />}
                        </div>

                        {/* Combined Suggestions Dropdown */}
                        {(showTopicSuggestions || (showSuggestions && suggestions.length > 0)) && (
                            <div className="ai-suggestions-dropdown">
                                {/* Topic Suggestions Section */}
                                {showTopicSuggestions && (
                                    <>
                                        <div className="ai-header" style={{ background: '#f0fdf4', color: '#15803d', borderBottomColor: '#bbf7d0' }}>
                                            <Lightbulb size={16} className="ai-icon" style={{ color: '#16a34a' }} />
                                            <span>Gợi ý chủ đề:</span>
                                        </div>
                                        <div className="suggestions-list">
                                            {filteredTopics.map((topic, index) => (
                                                <div
                                                    key={`topic-${index}`}
                                                    className="suggestion-item"
                                                    onClick={() => handleTopicSelect(topic)}
                                                >
                                                    <div className="suggestion-content">
                                                        <span className="suggestion-title">{topic}</span>
                                                    </div>
                                                    <ChevronRight size={16} className="arrow-icon" />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* AI/Similar Question Suggestions Section */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <>
                                        <div className="ai-header">
                                            <Sparkles size={16} className="ai-icon" />
                                            <span>Những câu hỏi tương tự đã có câu trả lời:</span>
                                        </div>
                                        <div className="suggestions-list">
                                            {suggestions.map((q) => (
                                                <div
                                                    key={q.maCauHoi}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick(q.maCauHoi)}
                                                >
                                                    <div className="suggestion-content">
                                                        <span className="suggestion-title">{q.tieuDe}</span>
                                                        <span className="suggestion-snippet">
                                                            {q.noiDung && q.noiDung.length > 60 ? q.noiDung.substring(0, 60) + '...' : q.noiDung}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} className="arrow-icon" />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="department">Lĩnh vực</label>
                        <select
                            id="department"
                            className="form-input"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="HOCTAP">Học tập</option>
                            <option value="DANGKYTINCHI">Đăng ký tín chỉ</option>
                            <option value="HP_HOCPHI">Học phí</option>
                            <option value="KHAC">Khác</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Gửi đến</label>
                        <input
                            type="text"
                            className="form-input"
                            value={cvhtInfo}
                            readOnly
                            disabled
                            style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} // Lighter gray
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Nội dung chi tiết <span className="highlight">*</span></label>
                        <textarea
                            id="content"
                            className="form-textarea"
                            placeholder="Mô tả chi tiết thắc mắc của bạn..."
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Đính kèm tệp</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="file-upload"
                                className="file-input"
                                onChange={handleFileChange}
                                hidden
                            />
                            <label htmlFor="file-upload" className="file-label">
                                <Paperclip size={18} />
                                <span>{selectedFile ? selectedFile.name : 'Chọn tệp tin (Hình ảnh, PDF, Word...)'}</span>
                            </label>
                            {selectedFile && (
                                <button onClick={() => setSelectedFile(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={16} color="red" />
                                </button>
                            )}
                            <span className="file-help">Tối đa 10MB</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={() => { setTitle(''); setContent(''); }}>Hủy bỏ</button>
                        <button className="btn-primary btn-submit" onClick={handleSubmit} disabled={loading}>
                            <Send size={18} />
                            {loading ? 'Đang gửi...' : 'Gửi câu hỏi'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default NewQuestion;
