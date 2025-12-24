import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Notification.css';

const Notification = ({ id, message, type, onClose }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 4000; // 4 seconds
        const interval = 50; // Update every 50ms
        const decrement = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - decrement;
                if (newProgress <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return newProgress;
            });
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />
    };

    const typeClass = `notification-${type}`;

    return (
        <div className={`notification ${typeClass}`}>
            <div className="notification-content">
                <div className="notification-icon">
                    {icons[type] || icons.info}
                </div>
                <div className="notification-message">{message}</div>
                <button
                    className="notification-close"
                    onClick={() => onClose(id)}
                    aria-label="Đóng"
                >
                    <X size={16} />
                </button>
            </div>
            <div className="notification-progress">
                <div
                    className="notification-progress-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default Notification;
