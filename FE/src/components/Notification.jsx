import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../redux/notificationSlice';

const notificationStyle = {
  position: 'fixed',
  top: 20,
  right: 20,
  minWidth: 250,
  padding: '12px 24px',
  borderRadius: 8,
  color: '#fff',
  zIndex: 9999,
  fontSize: 16,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const typeColors = {
  success: '#4caf50',
  error: '#f44336',
  info: '#2196f3',
};

const Notification = () => {
  const dispatch = useDispatch();
  const { type, message } = useSelector((state) => state.notification);

  useEffect(() => {
    if (type && message) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, message, dispatch]);

  if (!type || !message) return null;

  return (
    <div style={{ ...notificationStyle, background: typeColors[type] || '#333' }}>
      {message}
    </div>
  );
};

export default Notification; 