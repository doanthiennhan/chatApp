import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, message, Button, theme } from 'antd'; // Import theme
import { UserOutlined, CameraOutlined, MessageOutlined, DownOutlined, HomeOutlined, LogoutOutlined, GlobalOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/identityService';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';

import ThemeToggle from '../common/ThemeToggle';

const { Header } = Layout;
const { useToken } = theme; // Destructure useToken

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token } = useToken(); // Get theme tokens

  const menuItems = [
    { key: '/home', icon: <HomeOutlined />, label: t('home') },
    { key: '/camera', icon: <CameraOutlined />, label: t('camera') },
    { key: '/chat', icon: <MessageOutlined />, label: t('chat') },
    { key: '/profile', icon: <UserOutlined />, label: t('profile') },
    { key: '/statistics', icon: <BarChartOutlined />, label: t('statistics') },
  ];

  const logoutHandler = async () => {
    await logout();
    message.success(t('logout_success'));
    window.location.href = '/login';
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: t('personal_info'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: t('logout'),
      icon: <LogoutOutlined />,
      onClick: logoutHandler,
      danger: true,
    },
  ];

  const languageMenuItems = [
    {
      key: 'en',
      label: (
        <Space>
          <span role="img" aria-label="English">🇬🇧</span>
          <span>English</span>
        </Space>
      ),
    },
    {
      key: 'ja',
      label: (
        <Space>
          <span role="img" aria-label="Japanese">🇯🇵</span>
          <span>日本語</span>
        </Space>
      ),
    },
    {
      key: 'vi',
      label: (
        <Space>
          <span role="img" aria-label="Vietnamese">🇻🇳</span>
          <span>Tiếng Việt</span>
        </Space>
      ),
    },
  ];

  const handleLanguageChange = ({ key }) => {
    i18n.changeLanguage(key);
  };

  const handleMenuClick = (e) => {
    if (e.key !== location.pathname) {
      navigate(e.key);
    }
  };

  return (
    <Header
      style={{
        background: token.colorBgContainer, // Use theme token for background
        backdropFilter: 'blur(8px)',
        boxShadow: `0 4px 16px ${token.colorFillTertiary}`, // Use theme token for shadow
        borderBottom: `1px solid ${token.colorBorder}`, // Use theme token for border
        padding: '0 32px',
        position: 'fixed',
        width: '100%',
        zIndex: 100,
        height: 72,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <CameraOutlined style={{ fontSize: 32, color: token.colorPrimary }} /> {/* Use theme token */}
          <span style={{ fontWeight: 700, fontSize: 24, color: token.colorText }}>CameraCheck</span> {/* Use theme token */}
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            fontSize: 17,
            fontWeight: 600,
            border: 'none',
            background: 'transparent',
            minWidth: 340,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            color: token.colorTextSecondary, // Default text color for menu items
          }}
          // Override Ant Design's default active/selected styles
          // This might require custom CSS or more specific Ant Design Menu props
          // For now, let's rely on Ant Design's default selected styles which should pick up colorPrimary
          // If not, we'll need to add custom CSS for .ant-menu-item-selected .ant-menu-item-icon, etc.
        />
        <Space>
          <ThemeToggle />
          <Dropdown menu={{ items: languageMenuItems, onClick: handleLanguageChange, selectedKeys: [i18n.language] }} placement="bottomRight" trigger={['click']}>
            <Button shape="circle" icon={<GlobalOutlined />} />
          </Dropdown>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size={40} icon={<UserOutlined />} style={{ background: token.colorPrimary }} /> {/* Use theme token */}
              <DownOutlined style={{ fontSize: 14, color: token.colorTextSecondary }} /> {/* Use theme token */}
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;