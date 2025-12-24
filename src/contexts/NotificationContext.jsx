import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const showNotification = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        const notification = { id, message, type };
        
        setNotifications(prev => [...prev, notification]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showConfirm = useCallback((message, onConfirm, onCancel) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                message,
                onConfirm: () => {
                    setConfirmDialog(null);
                    if (onConfirm) onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmDialog(null);
                    if (onCancel) onCancel();
                    resolve(false);
                }
            });
        });
    }, []);

    const value = {
        notifications,
        showNotification,
        removeNotification,
        confirmDialog,
        showConfirm
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
