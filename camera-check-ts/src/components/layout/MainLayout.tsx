import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Content style={{ flex: 1, paddingTop: 72 }}>
        {children}
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default MainLayout;