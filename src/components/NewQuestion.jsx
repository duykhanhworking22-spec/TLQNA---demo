import React, { useState } from 'react';
import api from '../services/api';
import { Send, Paperclip, X } from 'lucide-react';
import './QuestionList.css'; // Common styles
import './NewQuestion.css';

const NewQuestion = () => {
    const [title, setTitle] = useState('');
    const [department, setDepartment] = useState('HOCTAP'); // Default domain/field
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cvhtInfo, setCvhtInfo] = useState('');

    React.useEffect(() => {
        // Fetch current user profile to get CVHT info
        api.get('/auth/profile')
            .then(res => {
                if (res.data && res.data.data) {
                    const { cvhtHoTen, cvhtMa } = res.data.data;
                    if (cvhtHoTen) {
                        setCvhtInfo(`${cvhtMa || 'N/A'} - ${cvhtHoTen}`);
                    } else {
                        setCvhtInfo('Chưa có Cố vấn học tập');
                    }
                }
            })
            .catch(err => console.error("Error fetching profile", err));
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('tieuDe', title);
            formData.append('noiDung', content);
            formData.append('linhVuc', department); // Assuming backend accepts this field
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await api.post('/questions', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.status === 200) {
                alert('Gửi câu hỏi thành công!');
                // Reset form
                setTitle('');
                setContent('');
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Lỗi khi gửi câu hỏi:', error);
            alert('Gửi thất bại. Vui lòng thử lại.');
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
                    <div className="form-group">
                        <label htmlFor="title">Chủ đề câu hỏi <span className="highlight">*</span></label>
                        <input
                            type="text"
                            id="title"
                            className="form-input"
                            placeholder="Nhập tiêu đề ngắn gọn cho câu hỏi..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
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
