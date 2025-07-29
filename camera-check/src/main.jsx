import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "antd/dist/reset.css";
import './styles/index.css';
import './styles/App.css';
import { Provider } from 'react-redux';
import store, { hydrateToken, setAccessToken, removeAccessToken } from './store';
import identityApi, { getAccessToken } from './services/identityService';
import { jwtDecode } from 'jwt-decode';
import { ConfigProvider, App as AntdApp } from 'antd';

// Polyfill for global object needed by SockJS
if (typeof global === 'undefined') {
  window.global = window;
}

// Test the polyfill
console.log('🔧 Global polyfill test:', typeof global, global === window);

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    console.log("Checking token validity...");
    const decoded = jwtDecode(token);
    console.log("Token expiration time:", decoded.exp, "Current time:", Date.now() / 1000);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    console.log("Token expiration time:", decoded.exp, "Current time:", now);
    return decoded.exp > now;
  } catch {
    return false;
  }
};

async function tryRefreshOnStartup() {
  store.dispatch(hydrateToken());
  const accessToken = getAccessToken();
  if (!isTokenValid(accessToken)) {
    try {
      const res = await identityApi.post('/auth/refresh-token');
      const { accessToken: newAccessToken } = res.data.data;
      store.dispatch(setAccessToken({ token: newAccessToken }));
      localStorage.setItem('accessToken', newAccessToken);
    } catch {
      store.dispatch(removeAccessToken());
    }
  } else {
    // store.dispatch(removeAccessToken());
  }
}

tryRefreshOnStartup().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
        },
      }}
    >
      <AntdApp>
        <Provider store={store}>
          <App />
        </Provider>
      </AntdApp>
    </ConfigProvider>
  );

});
