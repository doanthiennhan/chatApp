import { useState, useEffect } from "react";
import CameraCard from "../components/camera/CameraCard";
import AlertItem from "../components/chat/AlertItem";
import CameraModal from "../components/camera/CameraModal";
import CreateCameraModal from "../components/camera/CreateCameraModal";
import CameraPlayer from "../components/camera/CameraPlayer";
import { Row, Col, Card, Spin, message, Button, Drawer, Descriptions, Layout, Menu, Avatar, Dropdown, Space } from "antd";
import { PlusOutlined, UserOutlined, CameraOutlined, MessageOutlined, DownOutlined } from "@ant-design/icons";
import { fetchCameras } from "../services/cameraService";
import { useDispatch } from "react-redux";
import { deleteCamera, updateCamera } from "../store/slices/cameraSlice";
import useCameraHealthSSE from "../hooks/useCameraHealthSSE";
import { useNavigate, useLocation } from "react-router-dom";
import identityApi, { removeAccessToken } from "../services/identityService";


const { Header, Content } = Layout;

const menuItems = [
  { key: "/chat", icon: <MessageOutlined />, label: "Chat" },
  { key: "/camera", icon: <CameraOutlined />, label: "Camera" },
  { key: "/profile", icon: <UserOutlined />, label: "Profile" },
];

const Dashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [healthDrawerOpen, setHealthDrawerOpen] = useState(false);
  const [healthCamera, setHealthCamera] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
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

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setEditModalOpen(true);
  };

  const handleDelete = async (camera) => {
    try {
      await dispatch(deleteCamera(camera.id)).unwrap();
      message.success("Đã xóa camera thành công");
      loadCameras();
    } catch (err) {
      message.error("Xóa camera thất bại: " + (err?.message || err));
    }
  };

  const handleUpdate = async (values) => {
    try {
      await dispatch(updateCamera({ ...editingCamera, ...values })).unwrap();
      message.success("Cập nhật camera thành công");
      setEditModalOpen(false);
      setEditingCamera(null);
      loadCameras();
    } catch (err) {
      message.error("Cập nhật camera thất bại: " + (err?.message || err));
    }
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
          top: hideHeader ? "0px" : "72px",
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
          {/* Logo hoặc tên app */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CameraOutlined style={{ fontSize: 28, color: "#1677ff" }} />
            <span style={{ fontWeight: 700, fontSize: 22, color: "#222" }}>CameraCheck</span>
          </div>
          {/* Menu chính */}
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
          {/* Avatar user */}
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={["click"]}>
            <Space style={{ cursor: "pointer" }}>
              <Avatar size={38} icon={<UserOutlined />} style={{ background: "#1677ff" }} />
              <DownOutlined style={{ fontSize: 14, color: "#888" }} />
            </Space>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ paddingTop: 90 }}>
        <div>
          <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Danh sách Camera</h2>
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
              {loading ? (
                <Spin size="large" style={{ width: "100%", margin: "40px 0" }} />
              ) : (
                <Row gutter={[16, 16]}>
                  {cameras.map(camera => (
                    <Col xs={24} md={12} key={camera.id}>
                      <CameraCard 
                        camera={camera} 
                        onClick={setSelectedCamera} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCheckHealth={handleCheckHealth}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
            <Col xs={24} lg={8}>
              <Card title="System Alerts">
                {alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
                ))}
              </Card>
              {/* Camera Player cho camera đầu tiên */}
              {cameras[0] && <CameraPlayer camera={cameras[0]} />}
            </Col>
          </Row>
          {selectedCamera && (
            <CameraModal
              camera={selectedCamera}
              visible={!!selectedCamera}
              onClose={() => setSelectedCamera(null)}
            />
          )}
          <CreateCameraModal
            visible={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSuccess={loadCameras}
          />
          {editingCamera && (
            <CreateCameraModal
              visible={editModalOpen}
              onClose={() => { setEditModalOpen(false); setEditingCamera(null); }}
              onSuccess={loadCameras}
              initialValues={editingCamera}
              onFinish={handleUpdate}
              isEdit
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

export default Dashboard;