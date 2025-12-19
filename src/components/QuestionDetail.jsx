import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MessageSquare, Edit, Paperclip, X, Save, Send, History } from 'lucide-react';
import api, { questionApi } from '../services/api';
import './QuestionDetail.css';

const QuestionDetail = ({ questionId, onBack }) => {
    const [question, setQuestion] = useState(null);
    const [latestAnswer, setLatestAnswer] = useState(null);
    const [answerHistory, setAnswerHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loading, setLoading] = useState(true);

    // Reply State (CVHT)
    const [replyContent, setReplyContent] = useState('');
    const [replyFile, setReplyFile] = useState(null);
    const [sending, setSending] = useState(false);

    // Edit Question State (Student)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ tieuDe: '', noiDung: '' });
    const [editFile, setEditFile] = useState(null);
    const [saving, setSaving] = useState(false);

    // Edit Answer State (CVHT)
    const [isEditingAnswer, setIsEditingAnswer] = useState(false);
    const [editAnswerContent, setEditAnswerContent] = useState('');
    const [editAnswerFile, setEditAnswerFile] = useState(null);
    const [sendingAnswer, setSendingAnswer] = useState(false);

    // Determine Role
    const role = localStorage.getItem('role');
    const isCvht = role === 'cvht';
    const API_BASE = 'http://localhost:8081'; // Updated to 8081

    useEffect(() => {
        if (questionId) {
            fetchData();
        }
    }, [questionId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [qRes, aRes, hRes] = await Promise.all([
                questionApi.getById(questionId),
                questionApi.getLatestAnswer(questionId).catch(() => ({ data: { data: null } })),
                questionApi.getHistory(questionId).catch(() => ({ data: { data: [] } }))
            ]);

            setQuestion(qRes.data);
            setLatestAnswer(aRes.data?.data || null);
            setAnswerHistory(hRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setReplyFile(e.target.files[0]);
        }
    };

    // --- Edit Question Logic ---
    const handleEditClick = () => {
        setEditData({
            tieuDe: question.tieuDe,
            noiDung: question.noiDung
        });
        setEditFile(null);
        setIsEditing(true);
    };

    const handleEditFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditFile(e.target.files[0]);
        }
    };

    const handleSaveEdit = async () => {
        if (!editData.tieuDe.trim() || !editData.noiDung.trim()) {
            alert("Tiêu đề và nội dung không được để trống");
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('tieuDe', editData.tieuDe);
            formData.append('noiDung', editData.noiDung);
            formData.append('linhVuc', question.linhVuc || 'HOCTAP');
            if (editFile) {
                formData.append('file', editFile);
            }

            // Still using base direct PUT as it wasn't explicitly added to questionApi in the same way 
            // but let's assume we can use a generic update method or add it.
            // For now, let's just keep the endpoint but use api instance consistency.
            await api.put(`/questions/${questionId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Cập nhật câu hỏi thành công!');
            setIsEditing(false);
            fetchData();
        } catch (error) {
            console.error('Error updating question:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({ tieuDe: '', noiDung: '' });
        setEditFile(null);
    };

    // --- Edit Answer Logic (CVHT) ---
    const handleEditAnswerClick = () => {
        if (latestAnswer) {
            setEditAnswerContent(latestAnswer.noiDung);
            setEditAnswerFile(null);
            setIsEditingAnswer(true);
        }
    };

    const handleEditAnswerFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEditAnswerFile(e.target.files[0]);
        }
    };

    const handleCancelEditAnswer = () => {
        setIsEditingAnswer(false);
        setEditAnswerContent('');
        setEditAnswerFile(null);
    };

    const handleSaveAnswerEdit = async () => {
        if (!editAnswerContent.trim()) {
            alert("Nội dung trả lời không được để trống");
            return;
        }
        setSendingAnswer(true);
        try {
            const formData = new FormData();
            formData.append('noiDung', editAnswerContent);
            if (editAnswerFile) {
                formData.append('file', editAnswerFile);
            }

            await questionApi.answer(questionId, formData);

            alert('Cập nhật câu trả lời thành công!');
            setIsEditingAnswer(false);
            fetchData();
        } catch (error) {
            console.error('Error updating answer:', error);
            alert('Cập nhật thất bại.');
        } finally {
            setSendingAnswer(false);
        }
    };

    // --- Reply Logic ---
    const handleSendReply = async () => {
        if (!replyContent.trim()) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('noiDung', replyContent);
            if (replyFile) {
                formData.append('file', replyFile);
            }

            await questionApi.answer(questionId, formData);

            alert('Phản hồi thành công!');
            setReplyContent('');
            setReplyFile(null);
            fetchData();

        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Gửi phản hồi thất bại.');
        } finally {
            setSending(false);
        }
    };



    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status) => {
        switch (String(status).toUpperCase()) {
            case 'PENDING': return 'pending';
            case 'PROCESSING': return 'processing';
            case 'ANSWER':
            case 'ANSWERED':
            case 'COMPLETED':
            case '1': return 'completed';
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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải chi tiết...</div>;
    if (!question) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy câu hỏi.</div>;

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-center">
                    <span className="indicator-text">Chi tiết câu hỏi #{question.maCauHoi}</span>
                </div>
                <div className="top-bar-right">
                    <button className="back-btn" onClick={onBack} style={{ marginRight: '2rem' }}>
                        <ArrowLeft size={20} />
                        <span>Quay lại</span>
                    </button>
                </div>
            </header>

            <div className="content-container">
                <div className="detail-header-card">
                    <div className="detail-header-top">
                        <span className="detail-id">#{question.maCauHoi}</span>
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '1.25rem', fontWeight: 'bold', flex: 1, margin: '0 1rem' }}
                                value={editData.tieuDe}
                                onChange={e => setEditData({ ...editData, tieuDe: e.target.value })}
                            />
                        ) : (
                            <h1 className="detail-subject">{question.tieuDe}</h1>
                        )}
                        <span className={`status-badge ${getStatusClass(question.trangThai)}`}>
                            {getStatusLabel(question.trangThai)}
                        </span>
                    </div>
                    <div className="detail-meta">
                        <div className="meta-item">
                            <Clock size={16} />
                            <span>Gửi lúc: {formatDate(question.ngayGui)}</span>
                        </div>
                        <div className="meta-item">
                            <MessageSquare size={16} />
                            <span>Sinh viên: <strong>{question.tenSinhVien || question.maSinhVien}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="conversation-thread">
                    {/* User Question */}
                    <div className="message-node user-node">
                        <div className="node-avatar">
                            <div className="avatar-circle">SV</div>
                        </div>
                        <div className="node-content-wrapper">
                            <div className="node-header">
                                <span className="node-name">{question.tenSinhVien || 'Sinh viên'}</span>
                                <span className="node-time">{formatDate(question.ngayGui)}</span>
                                {!isCvht && !isEditing && (
                                    <button
                                        className="edit-btn"
                                        onClick={handleEditClick}
                                        title="Chỉnh sửa câu hỏi"
                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="node-body">
                                {isEditing ? (
                                    <div className="edit-form">
                                        <textarea
                                            className="form-textarea"
                                            rows={5}
                                            value={editData.noiDung}
                                            onChange={e => setEditData({ ...editData, noiDung: e.target.value })}
                                            style={{ width: '100%', marginBottom: '10px' }}
                                        ></textarea>

                                        <div className="file-input-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            <input type="file" id="edit-file" hidden onChange={handleEditFileChange} />
                                            <label htmlFor="edit-file" className="btn-attach" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6' }}>
                                                <Paperclip size={16} />
                                                <span>{editFile ? editFile.name : 'Thay đổi đính kèm'}</span>
                                            </label>
                                        </div>

                                        <div className="edit-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button className="btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                                                <X size={16} /> Hủy
                                            </button>
                                            <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>
                                                <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p style={{ whiteSpace: 'pre-line' }}>{question.noiDung}</p>
                                        {question.fileName && (
                                            <div className="attachment-box">
                                                <Paperclip size={14} />
                                                <a href={`${API_BASE}/api/questions/${question.maCauHoi}/file`} target="_blank" rel="noopener noreferrer">
                                                    {question.fileName}
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Latest Answer (if any) */}
                    {/* Latest Answer (if any) */}
                    {latestAnswer && (
                        <div className="message-node admin-node">
                            <div className="node-avatar">
                                <div className="avatar-circle admin">GV</div>
                            </div>
                            <div className="node-content-wrapper">
                                <div className="node-header">
                                    <span className="node-name">{latestAnswer.nguoiTraLoi || 'CVHT'}</span>
                                    <span className="role-badge">Cố vấn</span>
                                    <span className="node-time">{formatDate(latestAnswer.ngayTraLoi)}</span>
                                    {isCvht && !isEditingAnswer && (
                                        <button
                                            className="edit-btn"
                                            onClick={handleEditAnswerClick}
                                            title="Sửa câu trả lời"
                                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                    )}
                                </div>
                                <div className="node-body">
                                    {isEditingAnswer ? (
                                        <div className="edit-form">
                                            <textarea
                                                className="form-textarea"
                                                rows={5}
                                                value={editAnswerContent}
                                                onChange={e => setEditAnswerContent(e.target.value)}
                                                style={{ width: '100%', marginBottom: '10px' }}
                                            ></textarea>

                                            <div className="file-input-wrapper" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                <input type="file" id="edit-answer-file" hidden onChange={handleEditAnswerFileChange} />
                                                <label htmlFor="edit-answer-file" className="btn-attach" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6' }}>
                                                    <Paperclip size={16} />
                                                    <span>{editAnswerFile ? editAnswerFile.name : 'Thay đổi đính kèm'}</span>
                                                </label>
                                            </div>

                                            <div className="edit-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button className="btn-secondary" onClick={handleCancelEditAnswer} disabled={sendingAnswer}>
                                                    <X size={16} /> Hủy
                                                </button>
                                                <button className="btn-primary" onClick={handleSaveAnswerEdit} disabled={sendingAnswer}>
                                                    <Save size={16} /> {sendingAnswer ? 'Đang lưu...' : 'Cập nhật'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ whiteSpace: 'pre-line' }}>{latestAnswer.noiDung}</p>
                                            {latestAnswer.fileName && (
                                                <div className="attachment-box">
                                                    <Paperclip size={14} />
                                                    <a href={latestAnswer.fileDownloadUrl || `${API_BASE}/api/questions/versions/${latestAnswer.versionId}/file`} target="_blank" rel="noopener noreferrer">
                                                        {latestAnswer.fileName}
                                                    </a>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Button (If history exists and > 1 version) */}
                    {answerHistory.length > 1 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <History size={16} />
                                {showHistory ? 'Ẩn lịch sử chỉnh sửa' : 'Xem lịch sử chỉnh sửa'}
                            </button>
                        </div>
                    )}

                    {/* History List */}
                    {showHistory && (
                        <div className="history-list" style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Lịch sử chỉnh sửa:</h4>
                            {answerHistory.map((item) => (
                                <div key={item.version} className="history-item" style={{
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    marginBottom: '0.5rem',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: '#334155' }}>Phiên bản {item.version}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{formatDate(item.thoiGianTao)}</span>
                                    </div>
                                    <p style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', color: '#1e293b' }}>{item.noiDung}</p>
                                    {item.fileName && (
                                        <div className="attachment-box" style={{ marginTop: '0.5rem' }}>
                                            <Paperclip size={14} />
                                            <a href={item.downloadUrl || `${API_BASE}/api/questions/versions/${item.version}/file`} target="_blank" rel="noopener noreferrer">
                                                {item.fileName}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>



                {/* Reply Box Area - Only for CVHT */}
                {/* Reply Box Area - Only for CVHT and if not answered */}
                {isCvht && !['ANSWER', 'ANSWERED', 'COMPLETED', '1', 'REJECTED'].includes(String(question.trangThai).toUpperCase()) && (
                    <div className="reply-area">
                        <div className="reply-box">
                            <textarea
                                placeholder="Nhập phản hồi của bạn..."
                                rows={3}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            ></textarea>
                            <div className="reply-actions">
                                <div className="file-input-wrapper">
                                    <input type="file" id="reply-file" hidden onChange={handleFileChange} />
                                    <label htmlFor="reply-file" className="btn-attach" title="Đính kèm">
                                        <Paperclip size={18} />
                                        {replyFile && <span style={{ fontSize: '10px', marginLeft: '4px' }}>{replyFile.name}</span>}
                                    </label>
                                </div>
                                <button className="btn-primary btn-send" onClick={handleSendReply} disabled={sending}>
                                    <Send size={16} /> {sending ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default QuestionDetail;
