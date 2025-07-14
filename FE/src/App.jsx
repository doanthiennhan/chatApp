import React, { useEffect, useState } from 'react';
import RouterApp from './router';
import Notification from './components/Notification';
import { useDispatch } from 'react-redux';
import { setTokens, logout } from './redux/authSlice';
import { showNotification } from './redux/notificationSlice';
import { refreshToken as refreshTokenApi } from './api/authService';

function App() {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!localStorage.getItem('accessToken')) {
        try {
          const res = await refreshTokenApi();
          const { accessToken, refreshToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          dispatch(setTokens({ accessToken}));
        } catch {
          dispatch(logout());
          dispatch(showNotification({ type: 'error', message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' }));
        }
      }
      setIsAuthChecked(true);
    };
    checkAuth();
  }, [dispatch]);

  if (!isAuthChecked) return null;

  return (
    <>
      <Notification />
      <RouterApp />
    </>
  );
}

export default App;
