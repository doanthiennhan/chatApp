import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, message } from 'antd';
import { UserOutlined, CameraOutlined, MessageOutlined, DownOutlined, HomeOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { removeAccessToken } from '../../services/identityService';
import identityApi from '../../services/identityService';

const { Header } = Layout;

const menuItems = [
  { key: '/home', icon: <HomeOutlined />, label: 'Home' },
  { key: '/camera', icon: <CameraOutlined />, label: 'Camera' },
  { key: '/chat', icon: <MessageOutlined />, label: 'Chat' },
  { key: '/profile', icon: <UserOutlined />, label: 'Profile' },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = async () => {
    removeAccessToken();
    try {
      await identityApi.post('/auth/logout');
    } catch {
      // Do nothing
    }
    message.success('Đăng xuất thành công!');
    window.location.href = '/login';
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/profile')}>Thông tin cá nhân</Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logoutHandler} danger>Đăng xuất</Menu.Item>
    </Menu>
  );

  const handleMenuClick = (e) => {
    if (e.key !== location.pathname) {
      navigate(e.key);
    }
  };

  return (
    <Header
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #e8e8e8',
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
          <CameraOutlined style={{ fontSize: 32, color: '#1677ff' }} />
          <span style={{ fontWeight: 700, fontSize: 24, color: '#1a1a1a' }}>CameraCheck</span>
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
          }}
        />
        <Dropdown menu={{ items: userMenu.props.children.map(item => ({ key: item.key, label: item.props.children, icon: item.props.icon, danger: item.props.danger, onClick: item.props.onClick })) }} placement="bottomRight" trigger={['click']}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size={40} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
            <DownOutlined style={{ fontSize: 14, color: '#888' }} />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
