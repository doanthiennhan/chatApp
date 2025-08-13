
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CameraGridItem from "../components/camera/CameraGridItem";
import CreateCameraModal from "../components/camera/CreateCameraModal";
import { Row, Col, Spin, Button, Layout, Menu, Avatar, Dropdown, Space, Card, Typography, Badge, message } from "antd";
import { PlusOutlined, UserOutlined, CameraOutlined, MessageOutlined, DownOutlined, HomeOutlined, BellOutlined } from "@ant-design/icons";
import { getCameras, clearEditingCameraId } from "../store/slices/cameraSlice";
import CameraModal from "../components/camera/CameraModal";
import SelectCamerasModal from "../components/camera/SelectCamerasModal";
import WebSocketStatus from "../components/common/WebSocketStatus";
import ErrorBoundary from "../components/common/ErrorBoundary";
import "../styles/CameraGrid.scss";

import { useTranslation } from 'react-i18next';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

const Camera = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { list: cameras, status, editingCameraId, displayedCameraIds } = useSelector(state => state.camera);
  const displayedCameras = cameras.filter(cam => displayedCameraIds.includes(cam.id));
  const editingCamera = useSelector(state => 
    Array.isArray(state.camera.list) ? state.camera.list.find(cam => cam.id === editingCameraId) : undefined
  );
  
  

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

  

  const handleViewDetails = (camera) => {
    setSelectedCameraForModal(camera);
  };

  const handleCloseModal = () => {
    setSelectedCameraForModal(null);
  };

  const systemAlerts = [
    { id: 1, type: 'warning', message: t('camera_connection_lost'), time: t('time_ago', { count: 2, unit: 'min' }) },
    { id: 2, type: 'error', message: t('storage_space_low'), time: t('time_ago', { count: 5, unit: 'min' }) },
    { id: 3, type: 'info', message: t('system_update_available'), time: t('time_ago', { count: 10, unit: 'min' }) },
  ];
  

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Layout>
        <Content style={{ padding: "24px", background: "#f5f6fa" }}>
          <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 112px)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <Title level={3} style={{ margin: 0 }}>{t("live_monitoring_title")}</Title>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    {t("add_camera_button")}
                  </Button>
                  <Button
                    type="default"
                    icon={<CameraOutlined />}
                    onClick={() => setSelectCamerasModalOpen(true)}
                    style={{ fontWeight: 600, borderRadius: 6 }}
                  >
                    {t("select_cameras_button")}
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
                      <div style={{ fontSize: 18, marginBottom: 8 }}>{t("no_cameras_selected_message")}</div>
                      <div style={{ fontSize: 14, opacity: 0.7 }}>
                        {t("click_select_cameras_hint")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ width: "300px", background: "#fff", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <BellOutlined style={{ fontSize: 18, color: "#1677ff" }} />
                <Title level={5} style={{ margin: 0 }}>{t("system_alerts_title")}</Title>
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