
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Layout, Menu, Avatar, Dropdown, Space, Progress, List, Tag, Typography, Spin, theme } from 'antd'; // Import theme
import { 
  CameraOutlined, 
  UserOutlined, 
  MessageOutlined, 
  DownOutlined, 
  PlayCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  VideoCameraAddOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchCameras } from '../services/cameraService';
import identityApi, { removeAccessToken } from '../services/identityService';
import { message } from 'antd';

import '../styles/Home.scss'; // Import file CSS mới
import { useAllCameraRealTimeStatus } from '../hooks/useCameraRealTimeStatus';
import { useTranslation } from 'react-i18next';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useToken } = theme; // Destructure useToken

const Home = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { token } = useToken(); // Get theme tokens
  
  

  const allCameraRealTimeStatus = useAllCameraRealTimeStatus();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      if (window.scrollY > lastScrollY && window.scrollY > 40) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const res = await fetchCameras();
      const apiCameras = (res.data?.data || res.data || []).map((cam) => ({
        id: cam.id,
        name: cam.name,
        status: cam.status,
        imageQuality: cam.resolution ? "excellent" : "good",
        lastUpdated: new Date(),
        snapshotUrl: cam.snapshotUrl,
        hlsUrl: cam.hlsUrl,
        location: cam.location,
        type: cam.type,
        vendor: cam.vendor,
        rtspUrl: cam.rtspUrl,
      }));
      setCameras(apiCameras);
    } catch {
      message.error(t("camera_list_load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const logoutHandler = async () => {
    removeAccessToken();
    try {
      await identityApi.post("/auth/logout");
    } catch {
    }
    message.success(t("logout_success"));
    window.location.href = "/login";
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>{t("personal_info")}</Menu.Item>
      <Menu.Item key="logout" onClick={logoutHandler}>{t("logout")}</Menu.Item>
    </Menu>
  );

  const handleMenuClick = (e) => {
    if (e.key !== location.pathname) {
      navigate(e.key);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'error';
      case 'WARNING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ONLINE': return t("status_online");
      case 'OFFLINE': return t("status_offline");
      case 'WARNING': return t("status_warning");
      default: return t("status_unknown");
    }
  };

  const onlineCameras = cameras.filter(cam => 
    allCameraRealTimeStatus[cam.id]?.status === 'ONLINE' || cam.status === 'ONLINE'
  ).length;
  const totalCameras = cameras.length;
  const onlinePercentage = totalCameras > 0 ? (onlineCameras / totalCameras) * 100 : 0;

  return (
    <Layout style={{ minHeight: "100vh", background: token.colorBgLayout }}> {/* Use theme token */}
      <Content style={{ padding: "24px 32px" }}>
        <div className="home-hero-section fade-in-section">
          <Title level={1} style={{ marginBottom: 16 }}>
            {t("home_hero_title")}
          </Title>
          <Paragraph style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 24px' }}>
            {t("home_hero_description")}
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<VideoCameraAddOutlined />}
            onClick={() => navigate('/camera')}
          >
            {t("start_managing")}
          </Button>
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 48 }} className="fade-in-section">
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title={t("total_cameras")}
                value={totalCameras}
                prefix={<CameraOutlined style={{ color: token.colorPrimary }} />}
                valueStyle={{ color: token.colorPrimary }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title={t("active_cameras")}
                value={onlineCameras}
                prefix={<CheckCircleOutlined style={{ color: token.colorSuccess }} />}
                valueStyle={{ color: token.colorSuccess }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title={t("offline_cameras")}
                value={cameras.filter(cam => cam.status === 'offline').length}
                prefix={<PlayCircleOutlined style={{ color: token.colorWarning }} />}
                valueStyle={{ color: token.colorWarning }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title={t("viewers")}
                value={cameras.reduce((sum, cam) => sum + (cam.viewerCount || 0), 0)}
                prefix={<EyeOutlined style={{ color: token.colorPrimary }} />} 
                valueStyle={{ color: token.colorPrimary }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginBottom: 48 }} className="fade-in-section">
          <Col xs={24} lg={14}>
            <Card title={t("system_health_title")} className="home-section-card">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{fontSize: 16}}>{t("online_camera_rate")}</Text>
                  <Text strong style={{fontSize: 20, color: token.colorPrimary}}>{onlineCameras}/{totalCameras}</Text> {/* Use theme token */}
                </div>
                <Progress
                  percent={onlinePercentage}
                  status={onlinePercentage >= 80 ? "success" : onlinePercentage >= 50 ? "normal" : "exception"}
                  strokeColor={{
                    '0%': token.colorPrimary,
                    '100%': token.colorSuccess,
                  }}
                  trailColor={token.colorFillTertiary}
                />
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Tag color="success" icon={<CheckCircleOutlined />} style={{fontSize: 14, padding: '4px 10px'}}>
                  {onlineCameras} {t("online")}
                </Tag>
                <Tag color="error" icon={<ExclamationCircleOutlined />} style={{fontSize: 14, padding: '4px 10px'}}>
                  {totalCameras - onlineCameras} {t("offline")}
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title={t("quick_access_title")} className="home-section-card home-quick-access-card">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={() => navigate("/camera")}
                >
                  {t("manage_cameras")}
                </Button>
                <Button
                  icon={<MessageOutlined />}
                  onClick={() => navigate("/chat")}
                >
                  {t("system_chat")}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
        <Card
          title={<Title level={4}>{t("recent_active_cameras_title")}</Title>}
          extra={
            <Button type="link" onClick={() => navigate("/camera")} icon={<ArrowRightOutlined />}>
              {t("view_all")}
            </Button>
          }
          className="home-camera-list fade-in-section"
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={cameras.slice(0, 5)}
              renderItem={(camera) => (
                <List.Item
                  actions={[
                    <Tag color={getStatusColor(allCameraRealTimeStatus[camera.id]?.status || camera.status)} style={{minWidth: 100, textAlign: 'center'}}>
                      {getStatusText(allCameraRealTimeStatus[camera.id]?.status || camera.status)}
                    </Tag>,
                    <Button type="text" icon={<SettingOutlined />} onClick={() => navigate(`/camera?id=${camera.id}`)}>{t("details")}</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        shape="square"
                        size={48}
                        src={camera.snapshotUrl || 'https://via.placeholder.com/150'}
                        style={{backgroundColor: token.colorFillTertiary}}
                        icon={<CameraOutlined style={{color: token.colorPrimary}}/>}
                      />
                    }
                    title={<a href={`/camera?id=${camera.id}`} style={{ color: token.colorText }}>{camera.name}</a>}
                    description={<span style={{ color: token.colorTextSecondary }}>{camera.location || t("no_location_yet")}</span>}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Home;