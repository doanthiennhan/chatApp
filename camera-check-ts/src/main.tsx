import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "antd/dist/reset.css";
import './styles/App.scss';
import { Provider } from 'react-redux';
import store, { hydrateToken, setAccessToken, removeAccessToken } from './store';
import identityApi, { getAccessToken } from './services/identityService';
import { jwtDecode } from 'jwt-decode';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

const { darkAlgorithm, defaultAlgorithm } = theme;

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

const ThemedApp = () => {
  const { theme: themeName } = useContext(ThemeContext);

  return (
    <ConfigProvider
      theme={{
        algorithm: themeName === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: themeName === 'dark' ? {
          // Dark Mode Palette
          colorBgLayout: '#1E1E1E', // Nền Chính
          colorBgContainer: '#2C2C2C', // Thứ cấp/Nổi bật
          colorBorder: '#3C3C3C', // Đường viền/Phân tách
          colorText: '#E0E0E0', // Văn bản Chính
          colorTextSecondary: '#B0B0B0', // Văn bản Thứ cấp
          colorPrimary: '#64B5F6', // Màu nhấn/Tương tác (Blue)
          colorPrimaryHover: '#42A5F5', // Hover state for primary color
          colorSuccess: '#81C784', // Thành công
          colorWarning: '#FFD54F', // Cảnh báo
          colorError: '#E57373', // Lỗi
          colorFillTertiary: '#212121', // Mờ/Disabled (for subtle fills)
          borderRadius: 8,
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
        } : {
          // Light Mode Palette
          colorBgLayout: '#F9FAFB', // Nền Chính (very light grey)
          colorBgContainer: '#FFFFFF', // Nền Chính (white)
          colorBorder: '#E0E0E0', // Đường viền/Phân tách
          colorText: '#333333', // Văn bản Chính
          colorTextSecondary: '#666666', // Văn bản Thứ cấp
          colorPrimary: '#2196F3', // Màu nhấn/Tương tác (Blue)
          colorPrimaryHover: '#1976D2', // Hover state for primary color
          colorSuccess: '#4CAF50', // Thành công
          colorWarning: '#FFC107', // Cảnh báo
          colorError: '#F44336', // Lỗi
          colorFillTertiary: '#F0F0F0', // Thứ cấp/Nổi bật (for subtle fills)
          borderRadius: 8,
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
        },
      }}
    >
      <AntdApp>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

async function tryRefreshOnStartup() {
  store.dispatch(hydrateToken());
  const accessToken = getAccessToken();
  if (!isTokenValid(accessToken)) {
    try {
      const res = await identityApi.post('/api/auth/refresh-token');
      const { accessToken: newAccessToken } = res.data.data;
      store.dispatch(setAccessToken({ token: newAccessToken }));
      localStorage.setItem('accessToken', newAccessToken);
    } catch {
      store.dispatch(removeAccessToken());
    }
  }
}

tryRefreshOnStartup().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );
});