import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import Notification from './Notification';
import ConfirmDialog from './ConfirmDialog';
import './Notification.css';

const NotificationContainer = () => {
    const { notifications, removeNotification, confirmDialog } = useNotification();

    return (
        <>
            {/* Notification Toasts */}
            <div className="notification-container">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        id={notification.id}
                        message={notification.message}
                        type={notification.type}
                        onClose={removeNotification}
                    />
                ))}
            </div>

            {/* Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
        </>
    );
};

export default NotificationContainer;
