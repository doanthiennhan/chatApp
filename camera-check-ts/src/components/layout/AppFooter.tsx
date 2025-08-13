
import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, InstagramOutlined } from '@ant-design/icons';
import '../../styles/AppFooter.scss';
import { useTranslation } from 'react-i18next';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter = () => {
  const { t } = useTranslation();

  return (
    <Footer className="app-footer">
      <div className="footer-container">
        <Row gutter={[48, 24]} justify="space-around">
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">CameraCheck</h3>
            <Text type="secondary">
              {t('footer_description')}
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">{t('quick_links_title')}</h3>
            <ul className="footer-links">
              <li><Link href="#">{t('about_us')}</Link></li>
              <li><Link href="#">{t('services')}</Link></li>
              <li><Link href="#">{t('pricing')}</Link></li>
              <li><Link href="/contact">{t('contact_us')}</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <h3 className="footer-title">{t('follow_us_title')}</h3>
            <Space size="large" className="social-icons">
              <Link href="https://www.facebook.com/nhan.thien.972976?locale=vi_VN" target="_blank"><FacebookOutlined /></Link>
              <Link href="https://twitter.com" target="_blank"><TwitterOutlined /></Link>
              <Link href="https://www.linkedin.com/in/thien-nhan-doan-2046352b1/" target="_blank"><LinkedinOutlined /></Link>
              <Link href="https://instagram.com" target="_blank"><InstagramOutlined /></Link>
            </Space>
          </Col>
        </Row>
        <div className="footer-bottom">
          <Text type="secondary">&copy; {new Date().getFullYear()} CameraCheck. {t('all_rights_reserved')}</Text>
          <Space split={<span style={{ margin: '0 8px', color: '#aaa' }}>|</span>}>
            <Link href="/privacy-policy">{t('privacy_policy')}</Link>
            <Link href="/terms-of-service">{t('terms_of_service')}</Link>
          </Space>
        </div>
      </div>
    </Footer>
  );
};

export default AppFooter;