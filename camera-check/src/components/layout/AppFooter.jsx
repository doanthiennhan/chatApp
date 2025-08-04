import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';
import '../../styles/AppFooter.css';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter = () => {
  return (
    <Footer className="app-footer">
      <div className="footer-container">
        <Row gutter={[48, 24]} justify="space-around">
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">CameraCheck</h3>
            <Text type="secondary">
              Hệ thống giám sát camera thông minh, giúp bạn quản lý an ninh một cách hiệu quả và dễ dàng.
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><Link href="#">Về chúng tôi</Link></li>
              <li><Link href="#">Dịch vụ</Link></li>
              <li><Link href="#">Bảng giá</Link></li>
              <li><Link href="/contact">Liên hệ</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">Theo dõi chúng tôi</h3>
            <Space size="large" className="social-icons">
              <Link href="https://facebook.com" target="_blank"><FacebookOutlined /></Link>
              <Link href="https://twitter.com" target="_blank"><TwitterOutlined /></Link>
              <Link href="https://linkedin.com" target="_blank"><LinkedinOutlined /></Link>
              <Link href="https://instagram.com" target="_blank"><InstagramOutlined /></Link>
            </Space>
          </Col>
        </Row>
        <div className="footer-bottom">
          <Text type="secondary">&copy; {new Date().getFullYear()} CameraCheck. All Rights Reserved.</Text>
          <Space split={<span style={{ margin: '0 8px', color: '#aaa' }}>|</span>}>
            <Link href="/privacy-policy">Chính sách bảo mật</Link>
            <Link href="/terms-of-service">Điều khoản dịch vụ</Link>
          </Space>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;
