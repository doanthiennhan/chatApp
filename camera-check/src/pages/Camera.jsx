import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CameraCard from "../components/camera/CameraCard";
import AlertItem from "../components/chat/AlertItem";
import CameraModal from "../components/camera/CameraModal";
import CreateCameraModal from "../components/camera/CreateCameraModal";
import { Row, Col, Card, Spin, message, Button, Drawer, Descriptions, Layout, Menu, Avatar, Dropdown, Space } from "antd";
import { PlusOutlined, UserOutlined, CameraOutlined, MessageOutlined, DownOutlined, HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { getCameras, setSelectedCameraId, clearSelectedCameraId, setEditingCameraId, clearEditingCameraId } from "../store/slices/cameraSlice";
import useCameraHealthSSE from "../hooks/useCameraHealthSSE";
import { useNavigate, useLocation } from "react-router-dom";
import identityApi, { removeAccessToken } from "../services/identityService";

const { Header, Content } = Layout;

const menuItems = [
  { key: "/home", icon: <HomeOutlined />, label: "Home" },
  { key: "/camera", icon: <CameraOutlined />, label: "Camera" },
  { key: "/chat", icon: <MessageOutlined />, label: "Chat" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
];

const Camera = () => {
  const dispatch = useDispatch();
  const { list: cameras, status, selectedCameraId, editingCameraId } = useSelector(state => state.camera);
  const selectedCamera = useSelector(state => 
    Array.isArray(state.camera.list) ? state.camera.list.find(cam => cam.id === selectedCameraId) : undefined
  );
  const editingCamera = useSelector(state => 
    Array.isArray(state.camera.list) ? state.camera.list.find(cam => cam.id === editingCameraId) : undefined
  );

  const [alerts, setAlerts] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false); // Local state for create modal
  const [healthDrawerOpen, setHealthDrawerOpen] = useState(false);
  const [healthCamera, setHealthCamera] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const healthInfo = useCameraHealthSSE(healthCamera?.id, healthDrawerOpen);
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

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleCheckHealth = (camera) => {
    setHealthCamera(camera);
    setHealthDrawerOpen(true);
  };

  const handleCloseHealthDrawer = () => {
    setHealthDrawerOpen(false);
    setHealthCamera(null);
  };

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
            // Removed itemProps as it's not a valid prop for Menu
          />
          <Dropdown menu={{ items: userMenu.props.children }} placement="bottomRight" trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={38} icon={<UserOutlined />} style={{ background: "#1677ff" }} />
              <DownOutlined style={{ fontSize: 14, color: "#888" }} />
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ paddingTop: 90 }}>
        <div style={{ padding: "0 32px" }}>
          <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined style={{ fontSize: 20 }} />}
                  onClick={() => navigate("/home")}
                  style={{
                    color: "#1677ff",
                    fontWeight: 600,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  Quay lại Home
                </Button>
                <h2 style={{ margin: 0 }}>Quản lý Camera</h2>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
                style={{ fontWeight: 600, borderRadius: 6 }}
                size="large"
              >
                Thêm Camera
              </Button>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              {status === 'loading' ? (
                <Spin size="large" style={{ width: "100%", margin: "40px 0" }} />
              ) : (
                <Row gutter={[16, 16]}>
                  {cameras.length > 0 ? (
                    cameras.map(camera => (
                      <Col xs={24} md={12} key={camera.id}>
                        <CameraCard 
                          camera={camera} 
                          onCheckHealth={handleCheckHealth}
                        />
                      </Col>
                    ))
                  ) : (
                    <Col span={24} style={{ textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
                      <div style={{ fontSize: 18, marginBottom: 8 }}>Chưa có camera nào được thêm.</div>
                      <div style={{ fontSize: 14, opacity: 0.7 }}>
                        Click "Thêm Camera" để bắt đầu quản lý.
                      </div>
                    </Col>
                  )}
                </Row>
              )}
            </Col>
            <Col xs={24} lg={8}>
              <Card title="System Alerts">
                {alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
              </Card>
              {/* Hiển thị thông báo khi chưa chọn camera */}
              {!selectedCameraId && (
                <Card 
                  title="Camera Stream" 
                  style={{ marginTop: 16 }}
                  styles={{ body: { 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#666'
                  } }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>Chưa chọn camera</div>
                  <div style={{ fontSize: 14, opacity: 0.7 }}>
                    Click vào một camera để xem stream
                  </div>
                </Card>
              )}
              {/* Hiển thị thông tin camera đã chọn */}
              {selectedCameraId && selectedCamera && (
                <Card 
                  title={`Camera: ${selectedCamera.name}`}
                  style={{ marginTop: 16 }}
                  styles={{ body: { 
                    textAlign: 'center', 
                    padding: '20px',
                    color: '#666'
                  } }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>Camera đã chọn</div>
                  <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>
                    {selectedCamera.name}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    Click vào camera khác để thay đổi
                  </div>
                </Card>
              )}
            </Col>
          </Row>
          <CameraModal />
          {createModalOpen && (
            <CreateCameraModal 
              visible={createModalOpen}
              onClose={() => setCreateModalOpen(false)}
            />
          )}
          {editingCameraId && editingCamera && (
            <CreateCameraModal 
              visible={!!editingCameraId}
              onClose={() => dispatch(clearEditingCameraId())}
            />
          )}
          <Drawer
            title={healthCamera ? `Tình trạng Camera: ${healthCamera.name}` : "Tình trạng Camera"}
            placement="right"
            onClose={handleCloseHealthDrawer}
            open={healthDrawerOpen}
            width={400}
          >
            {healthInfo ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Camera ID">{healthInfo.cameraId}</Descriptions.Item>
                <Descriptions.Item label="Status">{healthInfo.status}</Descriptions.Item>
                <Descriptions.Item label="Video Codec">{healthInfo.videoCodec}</Descriptions.Item>
                <Descriptions.Item label="Audio Codec">{healthInfo.audioCodec}</Descriptions.Item>
                <Descriptions.Item label="Resolution">{healthInfo.resolution}</Descriptions.Item>
                <Descriptions.Item label="Frame Rate">{healthInfo.frameRate}</Descriptions.Item>
                <Descriptions.Item label="Bit Rate">{healthInfo.bitRate}</Descriptions.Item>
                <Descriptions.Item label="Format">{healthInfo.format}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật">{healthInfo.updatedAt}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div>Không có dữ liệu tình trạng.</div>
            )}
          </Drawer>
        </div>
      </Content>
    </Layout>
  );
};

export default Camera;

