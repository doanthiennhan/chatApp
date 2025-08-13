import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Layout, Menu, Avatar, Dropdown, Space, Progress, List, Tag, Typography, Spin } from 'antd';
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
import AppFooter from '../components/layout/AppFooter'; // Import AppFooter
import '../styles/Home.css'; // Import file CSS mới
import { useAllCameraRealTimeStatus } from '../hooks/useCameraRealTimeStatus';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const menuItems = [
  { key: "/home", icon: <HomeOutlined />, label: "Home" },
  { key: "/camera", icon: <CameraOutlined />, label: "Camera" },
  { key: "/chat", icon: <MessageOutlined />, label: "Chat" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
];

const Home = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sử dụng hook để lấy real-time status của tất cả camera
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
      message.error("Không thể tải danh sách camera");
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
      // Do nothing
    }
    message.success("Đăng xuất thành công!");
    window.location.href = "/login";
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>Thông tin cá nhân</Menu.Item>
      <Menu.Item key="logout" onClick={logoutHandler}>Đăng xuất</Menu.Item>
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
      case 'ONLINE': return 'Hoạt động';
      case 'OFFLINE': return 'Ngoại tuyến';
      case 'WARNING': return 'Cảnh báo';
      default: return 'Không xác định';
    }
  };

  // Tính toán số camera online dựa trên real-time status
  const onlineCameras = cameras.filter(cam => 
    allCameraRealTimeStatus[cam.id]?.status === 'ONLINE' || cam.status === 'ONLINE'
  ).length;
  const totalCameras = cameras.length;
  const onlinePercentage = totalCameras > 0 ? (onlineCameras / totalCameras) * 100 : 0;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Header
        style={{
          background: scrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          boxShadow: scrolled ? "0 6px 24px rgba(0,0,0,0.08)" : "0 4px 16px rgba(0,0,0,0.04)",
          borderBottom: "1px solid #e8e8e8",
          transition: "all 0.3s ease",
          padding: "0 32px",
          position: "fixed",
          width: "100%",
          zIndex: 100,
          height: 72,
          display: "flex",
          alignItems: "center",
          top: hideHeader ? "-72px" : "0",
          left: 0,
        }}
      >
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CameraOutlined style={{ fontSize: 32, color: "#1677ff" }} />
            <span style={{ fontWeight: 700, fontSize: 24, color: "#1a1a1a" }}>CameraCheck</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              fontSize: 17,
              fontWeight: 600,
              border: "none",
              background: "transparent",
              minWidth: 340,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={40} icon={<UserOutlined />} style={{ background: "#1677ff" }} />
              <DownOutlined style={{ fontSize: 14, color: "#888" }} />
            </Space>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ paddingTop: 90, padding: "24px 32px" }}>
        {/* Hero Section */}
        <div className="home-hero-section fade-in-section">
          <Title level={1} style={{ marginBottom: 16 }}>
            Hệ thống Giám sát Camera Thông minh
          </Title>
          <Paragraph style={{ fontSize: 18, maxWidth: 600, margin: '0 auto 24px' }}>
            Theo dõi, quản lý và phân tích tất cả các camera của bạn từ một nơi duy nhất. An toàn, hiệu quả và dễ sử dụng.
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            icon={<VideoCameraAddOutlined />}
            onClick={() => navigate('/camera')}
          >
            Bắt đầu Quản lý
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }} className="fade-in-section">
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title="Tổng số Camera"
                value={totalCameras}
                prefix={<CameraOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title="Đang hoạt động"
                value={onlineCameras}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title="Ngoại tuyến"
                value={cameras.filter(cam => cam.status === 'offline').length}
                prefix={<PlayCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="home-statistic-card">
              <Statistic
                title="Người xem"
                value={cameras.reduce((sum, cam) => sum + (cam.viewerCount || 0), 0)}
                prefix={<EyeOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* System Health & Quick Access */}
        <Row gutter={[24, 24]} style={{ marginBottom: 48 }} className="fade-in-section">
          <Col xs={24} lg={14}>
            <Card title="Tình trạng Hệ thống" className="home-section-card">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{fontSize: 16}}>Tỷ lệ Camera Online</Text>
                  <Text strong style={{fontSize: 20, color: '#1677ff'}}>{onlineCameras}/{totalCameras}</Text>
                </div>
                <Progress 
                  percent={onlinePercentage} 
                  status={onlinePercentage >= 80 ? "success" : onlinePercentage >= 50 ? "normal" : "exception"}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  trailColor="rgba(0,0,0,0.06)"
                />
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Tag color="success" icon={<CheckCircleOutlined />} style={{fontSize: 14, padding: '4px 10px'}}>
                  {onlineCameras} Online
                </Tag>
                <Tag color="error" icon={<ExclamationCircleOutlined />} style={{fontSize: 14, padding: '4px 10px'}}>
                  {totalCameras - onlineCameras} Offline
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Truy cập Nhanh" className="home-section-card home-quick-access-card">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />}
                  onClick={() => navigate("/camera")}
                >
                  Quản lý Camera
                </Button>
                <Button 
                  icon={<MessageOutlined />}
                  onClick={() => navigate("/chat")}
                >
                  Chat Hệ thống
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Cameras List */}
        <Card 
          title={<Title level={4}>Camera hoạt động gần đây</Title>}
          extra={
            <Button type="link" onClick={() => navigate("/camera")} icon={<ArrowRightOutlined />}>
              Xem tất cả
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
                    <Button type="text" icon={<SettingOutlined />} onClick={() => navigate(`/camera?id=${camera.id}`)}>Chi tiết</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        shape="square" 
                        size={48} 
                        src={camera.snapshotUrl || 'https://via.placeholder.com/150'}
                        style={{backgroundColor: '#e6f7ff'}}
                        icon={<CameraOutlined style={{color: '#1677ff'}}/>}
                      />
                    }
                    title={<a href={`/camera?id=${camera.id}`}>{camera.name}</a>}
                    description={camera.location || "Chưa có vị trí"}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default Home;
 