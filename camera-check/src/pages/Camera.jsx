import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CameraGridItem from "../components/camera/CameraGridItem";
import CreateCameraModal from "../components/camera/CreateCameraModal";
import { Row, Col, Spin, Button, Layout, Menu, Avatar, Dropdown, Space, Card, Typography, Badge } from "antd";
import { PlusOutlined, UserOutlined, CameraOutlined, MessageOutlined, DownOutlined, HomeOutlined, BellOutlined } from "@ant-design/icons";
import { getCameras, setEditingCameraId, clearEditingCameraId } from "../store/slices/cameraSlice";
import CameraModal from "../components/camera/CameraModal";
import SelectCamerasModal from "../components/camera/SelectCamerasModal";
import { useAllCameraRealTimeStatus } from "../hooks/useCameraRealTimeStatus";
import WebSocketStatus from "../components/common/WebSocketStatus";
import ErrorBoundary from "../components/common/ErrorBoundary";
import "../styles/CameraGrid.css";
import { useNavigate, useLocation } from "react-router-dom";
import identityApi, { removeAccessToken } from "../services/identityService";

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const menuItems = [
  { key: "/home", icon: <HomeOutlined />, label: "Home" },
  { key: "/camera", icon: <CameraOutlined />, label: "Camera" },
  { key: "/chat", icon: <MessageOutlined />, label: "Chat" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
];

const Camera = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { list: cameras, status, editingCameraId, displayedCameraIds } = useSelector(state => state.camera);
  const displayedCameras = cameras.filter(cam => displayedCameraIds.includes(cam.id));
  const editingCamera = useSelector(state => 
    Array.isArray(state.camera.list) ? state.camera.list.find(cam => cam.id === editingCameraId) : undefined
  );
  
  const allCameraRealTimeStatus = useAllCameraRealTimeStatus();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectCamerasModalOpen, setSelectCamerasModalOpen] = useState(false);
  const [selectedCameraForModal, setSelectedCameraForModal] = useState(null);
  const [gridCols, setGridCols] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setGridCols(3);
      } else if (window.innerWidth >= 768) {
        setGridCols(2);
      } else {
        setGridCols(1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(getCameras());
  }, [dispatch]);

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

  const handleViewDetails = (camera) => {
    setSelectedCameraForModal(camera);
  };

  const handleCloseModal = () => {
    setSelectedCameraForModal(null);
  };

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'Camera 1 connection lost', time: '2 min ago' },
    { id: 2, type: 'error', message: 'Storage space low', time: '5 min ago' },
    { id: 3, type: 'info', message: 'System update available', time: '10 min ago' },
  ];
  const getCameraRealTimeStatus = (cameraId) => {
    return allCameraRealTimeStatus[cameraId] || { status: 'OFFLINE', viewerCount: 0 };
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Header
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #e5e7eb",
          padding: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          padding: "0 24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CameraOutlined style={{ fontSize: 24, color: "#1677ff" }} />
            <span style={{ fontWeight: 700, fontSize: 20, color: "#111827" }}>CameraCheck</span>
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
            style={{
              fontSize: 16,
              fontWeight: 500,
              border: "none",
              background: "transparent",
              minWidth: 300,
              display: "flex",
              justifyContent: "center",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <WebSocketStatus />

            <Dropdown menu={{ items: userMenu.props.children }} placement="bottomRight" trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar size={36} icon={<UserOutlined />} style={{ background: "#1677ff" }} />
                <DownOutlined style={{ fontSize: 12, color: "#6b7280" }} />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Layout>
        <Content style={{ padding: "24px", background: "#f5f6fa" }}>
          <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 112px)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <Title level={3} style={{ margin: 0 }}>Live Monitoring</Title>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    Add Camera
                  </Button>
                  <Button
                    type="default"
                    icon={<CameraOutlined />}
                    onClick={() => setSelectCamerasModalOpen(true)}
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    Select Cameras
                  </Button>
                </div>
              </div>

              {status === 'loading' ? (
                <Spin size="large" style={{ width: "100%", margin: "40px 0" }} />
              ) : (
                <div className={`camera-grid cols-${gridCols}`}>
                  {displayedCameras.length > 0 ? (
                    displayedCameras.map(camera => {
                      return (
                        <ErrorBoundary key={camera.id}>
                          <CameraGridItem 
                            camera={camera} 
                            onViewDetails={handleViewDetails} 
                          />
                        </ErrorBoundary>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
                      <div style={{ fontSize: 18, marginBottom: 8 }}>No cameras selected for display.</div>
                      <div style={{ fontSize: 14, opacity: 0.7 }}>
                        Click "Select Cameras" to add cameras to the monitoring grid.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ width: "300px", background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <BellOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                <Title level={5} style={{ margin: 0 }}>System Alerts</Title>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {systemAlerts.map(alert => (
                  <Card
                    key={alert.id}
                    size="small"
                    style={{ 
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      backgroundColor: alert.type === 'error' ? '#fef2f2' : 
                                    alert.type === 'warning' ? '#fffbeb' : '#f0f9ff'
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: "12px", 
                          color: alert.type === 'error' ? '#dc2626' : 
                                 alert.type === 'warning' ? '#d97706' : '#2563eb'
                        }}>
                          {alert.message}
                        </Text>
                        <div style={{ marginTop: "4px" }}>
                          <Text style={{ fontSize: "10px", color: "#6b7280" }}>
                            {alert.time}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Content>
      </Layout>

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
      {selectedCameraForModal && (
        <CameraModal
          selectedCamera={selectedCameraForModal}
          visible={!!selectedCameraForModal}
          onClose={handleCloseModal}
        />
      )}
      {selectCamerasModalOpen && (
        <SelectCamerasModal
          visible={selectCamerasModalOpen}
          onClose={() => setSelectCamerasModalOpen(false)}
        />
      )}
    </Layout>
  );
};

export default Camera;

