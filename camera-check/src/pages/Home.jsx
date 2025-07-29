import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Layout, Menu, Avatar, Dropdown, Space, Progress, List, Tag, Typography } from 'antd';
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
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchCameras } from '../services/cameraService';
import identityApi, { removeAccessToken } from '../services/identityService';
import { message } from 'antd';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

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
    } catch (err) {
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
    } catch {}
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
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Hoạt động';
      case 'offline': return 'Ngoại tuyến';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  const onlineCameras = cameras.filter(cam => cam.status === 'online').length;
  const totalCameras = cameras.length;
  const onlinePercentage = totalCameras > 0 ? (onlineCameras / totalCameras) * 100 : 0;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Header
        style={{
          background: "#fff",
          boxShadow: scrolled ? "0 6px 24px rgba(0,0,0,0.13)" : "0 4px 16px rgba(0,0,0,0.08)",
          borderBottom: scrolled ? "2px solid #e5e7ef" : "none",
          transition: "top 0.3s, box-shadow 0.2s, border-bottom 0.2s",
          padding: 0,
          position: "fixed",
          width: "100%",
          zIndex: 100,
          borderRadius: "0 0 18px 18px",
          height: 72,
          display: "flex",
          alignItems: "center",
          backdropFilter: scrolled ? "blur(6px)" : undefined,
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
          padding: "0 32px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CameraOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            <span style={{ fontWeight: 700, fontSize: 22, color: "#222" }}>CameraCheck</span>
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
              boxShadow: "none",
              background: "transparent",
              borderRadius: 12,
              minWidth: 340,
              display: "flex",
              gap: 8,
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
            itemProps={{
              style: {
                borderRadius: 8,
                transition: "background 0.2s",
                margin: "0 4px"
              }
            }}
          />
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={38} icon={<UserOutlined />} style={{ background: "#1677ff" }} />
              <DownOutlined style={{ fontSize: 14, color: "#888" }} />
            </Space>
          </Dropdown>
        </div>
      </Header>
      
      <Content style={{ paddingTop: 90 }}>
        <div style={{ padding: "0 32px" }}>
          {/* Welcome Section */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Title level={1} style={{ color: "#1677ff", marginBottom: 16 }}>
              Chào mừng đến với CameraCheck
            </Title>
            <Text style={{ fontSize: 18, color: "#666" }}>
              Hệ thống giám sát camera thông minh và hiệu quả
            </Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng Camera"
                  value={totalCameras}
                  prefix={<CameraOutlined style={{ color: "#1677ff" }} />}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Camera Hoạt động"
                  value={onlineCameras}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Đang Stream"
                  value={cameras.filter(cam => cam.status === 'streaming').length}
                  prefix={<PlayCircleOutlined style={{ color: "#fa8c16" }} />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Người xem"
                  value={cameras.reduce((sum, cam) => sum + (cam.viewerCount || 0), 0)}
                  prefix={<EyeOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* System Health */}
          <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
            <Col xs={24} lg={12}>
              <Card title="Tình trạng Hệ thống" style={{ height: "100%" }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>Camera Online</Text>
                    <Text strong>{onlineCameras}/{totalCameras}</Text>
                  </div>
                  <Progress 
                    percent={onlinePercentage} 
                    status={onlinePercentage >= 80 ? "success" : onlinePercentage >= 50 ? "normal" : "exception"}
                    strokeColor="#1677ff"
                  />
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    {onlineCameras} Online
                  </Tag>
                  <Tag color="error" icon={<ExclamationCircleOutlined />}>
                    {totalCameras - onlineCameras} Offline
                  </Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Truy cập Nhanh" style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<CameraOutlined />}
                    onClick={() => navigate("/camera")}
                    style={{ height: 56, fontSize: 16, fontWeight: 600 }}
                  >
                    Quản lý Camera
                  </Button>
                  <Button 
                    size="large" 
                    icon={<MessageOutlined />}
                    onClick={() => navigate("/chat")}
                    style={{ height: 56, fontSize: 16, fontWeight: 600 }}
                  >
                    Chat Hệ thống
                  </Button>
                  <Button 
                    size="large" 
                    icon={<UserOutlined />}
                    onClick={() => navigate("/profile")}
                    style={{ height: 56, fontSize: 16, fontWeight: 600 }}
                  >
                    Thông tin Cá nhân
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Recent Cameras */}
          <Card title="Camera Gần đây" extra={
            <Button type="link" onClick={() => navigate("/camera")}>
              Xem tất cả <ArrowRightOutlined />
            </Button>
          }>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div>Đang tải...</div>
              </div>
            ) : (
              <List
                dataSource={cameras.slice(0, 4)}
                renderItem={(camera) => (
                  <List.Item
                    actions={[
                      <Tag color={getStatusColor(camera.status)}>
                        {getStatusText(camera.status)}
                      </Tag>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<CameraOutlined style={{ fontSize: 24, color: "#1677ff" }} />}
                      title={camera.name}
                      description={camera.location || "Chưa có vị trí"}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Home; 