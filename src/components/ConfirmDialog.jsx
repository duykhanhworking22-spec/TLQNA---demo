import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Notification.css';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="confirm-backdrop" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon">
                    <AlertCircle size={48} />
                </div>
                <div className="confirm-message">{message}</div>
                <div className="confirm-actions">
                    <button
                        className="confirm-btn confirm-btn-cancel"
                        onClick={onCancel}
                    >
                        Hủy
                    </button>
                    <button
                        className="confirm-btn confirm-btn-confirm"
                        onClick={onConfirm}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
