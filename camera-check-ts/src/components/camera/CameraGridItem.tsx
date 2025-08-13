import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Tooltip, Space, Typography, message, theme } from 'antd'; // Import theme
import { PlayCircleOutlined, StopOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FullscreenOutlined, FullscreenExitOutlined, ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, SoundOutlined, SoundFilled, HeartOutlined } from '@ant-design/icons';
import { startStreaming, stopStreaming, setEditingCameraId, deleteCamera } from '../../store/slices/cameraSlice';
import { useJsmpegPlayer } from '../../hooks/useJsmpegPlayer';
import { useCameraRealTimeStatus } from '../../hooks/useCameraRealTimeStatus';
import { formatBitrate } from '../../utils/websocket';
import { Camera } from '../../types';
import { RootState, AppDispatch } from '../../store';

const { Text } = Typography;
const { useToken } = theme; // Destructure useToken

interface CameraGridItemProps {
  camera: Camera;
  onViewDetails: (camera: Camera) => void;
}

const CameraGridItem: React.FC<CameraGridItemProps> = ({ camera, onViewDetails }) => {
  const dispatch = useDispatch<AppDispatch>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const { token } = useToken(); // Get theme tokens

  const activeStreamIds = useSelector((state: RootState) => state.camera.activeStreamIds);
  const isStreaming = camera?.id ? activeStreamIds.includes(camera.id) : false;

  const { connectionStatus, fps, bitrate, resolution, isMuted, toggleMute, viewerCount, uptime, isOnline } = useJsmpegPlayer(camera?.id, isStreaming, canvasRef);
  
  const realTimeStatus = useCameraRealTimeStatus(camera?.id);

  

  const handlePlay = () => {
    if (camera?.id) {
      dispatch(startStreaming(camera.id));
    }
  };

  const handleStop = () => {
    if (camera?.id) {
      dispatch(stopStreaming(camera.id));
    }
  };

  const handleEdit = () => {
    if (camera?.id) {
      dispatch(setEditingCameraId(camera.id));
    }
  };

  const handleDelete = async () => {
    if (!camera?.id) return;
    
    try {
      await dispatch(deleteCamera(camera.id)).unwrap();
      message.success(`Đã xóa camera "${camera?.name || 'Unknown'}" thành công.`);
    } catch (err: any) {
      message.error(`Xóa camera thất bại: ${err.message}`);
    }
  };

  const handleFullscreen = () => {
    if (cardRef.current) {
      if (!document.fullscreenElement) {
        cardRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const currentStatus = realTimeStatus?.status || camera?.status || 'OFFLINE';
  const currentViewerCount = viewerCount || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return token.colorSuccess;
      case 'OFFLINE':
        return token.colorPrimary;
      case 'ERROR':
        return token.colorError;
      default:
        return token.colorPrimary;
    }
  };

  return (
    <Card
      ref={cardRef} 
      className="camera-grid-item-card"
      style={{ 
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: `1px solid ${token.colorBorder}`,
        overflow: "hidden"
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div className="camera-video-container">
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: getStatusColor(currentStatus),
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          fontWeight: "600",
          zIndex: 10
        }}>
          {currentStatus}
        </div>

        {!isStreaming ? (
          <div style={{ 
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", 
            height: "100%", 
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src={camera?.snapshotUrl ? `${camera.snapshotUrl}?t=${Date.now()}` : 'https://via.placeholder.com/400x300/1a1a1a/666666?text=No+Image'} 
              alt="snapshot" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "contain",
                filter: "brightness(0.7)"
              }}
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          />
        )}

        {isStreaming && (
          <div className="camera-video-overlay"> 
            <div className="camera-overlay-top-right">
              <Tooltip title="Phóng to">
                <Button shape="circle" icon={<ZoomInOutlined />} onClick={handleZoomIn} className="camera-overlay-button" />
              </Tooltip>
              <Tooltip title="Thu nhỏ">
                <Button shape="circle" icon={<ZoomOutOutlined />} onClick={handleZoomOut} className="camera-overlay-button" />
              </Tooltip>
              <Tooltip title="Reset Zoom">
                <Button shape="circle" icon={<ReloadOutlined />} onClick={handleResetZoom} className="camera-overlay-button" />
              </Tooltip>
              <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                <Button 
                  shape="circle" 
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
                  onClick={handleFullscreen} 
                  className="camera-overlay-button" 
                />
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <Text strong style={{ fontSize: "14px", color: token.colorText }}>{camera?.name || 'Unknown Camera'}</Text>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {currentViewerCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <EyeOutlined style={{ fontSize: "12px", color: token.colorPrimary }} />
                <Text style={{ fontSize: "11px", color: token.colorPrimary }}>
                  {currentViewerCount}
                </Text>
              </div>
            )}
            
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                background: currentStatus === 'ONLINE' ? token.colorSuccess : token.colorWarning
              }} />
              <Text style={{ 
                fontSize: "12px", 
                color: currentStatus === 'ONLINE' ? token.colorSuccess : token.colorWarning
              }}>
                {currentStatus === 'ONLINE' ? 'good' : 'warning'}
              </Text>
            </div>
          </div>
        </div>
        
        <Text style={{ fontSize: "11px", color: token.colorTextSecondary }}>
          {realTimeStatus?.lastUpdated ? 
            new Date(realTimeStatus.lastUpdated).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            }) :
            new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            })
          }
        </Text>
      </div>

      <div style={{ 
        padding: "8px 16px", 
        borderTop: `1px solid ${token.colorBorder}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => onViewDetails(camera)}
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>
          
          <Tooltip title={isMuted ? "Bật tiếng" : "Tắt tiếng"}>
            <Button 
              type="text" 
              icon={isMuted ? <SoundOutlined /> : <SoundFilled />} 
              size="small"
              onClick={toggleMute}
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>

          {isStreaming ? (
            <Tooltip title="Dừng Stream">
              <Button 
                type="text" 
                icon={<StopOutlined />} 
                size="small"
                danger
                onClick={handleStop}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Bắt đầu Stream">
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />} 
                size="small"
                style={{ color: token.colorSuccess }}
                onClick={handlePlay}
              />
            </Tooltip>
          )}

          <Tooltip title="Sửa thông tin">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small"
              onClick={handleEdit}
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>

          <Tooltip title="Xóa camera">
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              size="small"
              danger
              onClick={handleDelete}
            />
          </Tooltip>
        </div>

        <Tooltip title="Like">
          <Button 
            type="text" 
            icon={<HeartOutlined />} 
            size="small"
            style={{ color: token.colorError }}
          />
        </Tooltip>
      </div>

        {currentViewerCount > 0 && (
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${token.colorBorder}`, backgroundColor: token.colorFillTertiary }}>
            <Space size="middle" wrap style={{ fontSize: "11px" }}>
              <Text style={{ color: token.colorTextSecondary }}>Viewers: <Text strong style={{ color: token.colorText }}>{currentViewerCount}</Text></Text>
            </Space>
          </div>
        )}

        {isStreaming && (
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${token.colorBorder}`, backgroundColor: token.colorFillTertiary }}>
            <Space size="middle" wrap style={{ fontSize: "11px" }}>
              <Text style={{ color: token.colorTextSecondary }}>FPS: <Text strong style={{ color: token.colorText }}>{fps}</Text></Text>
              <Text style={{ color: token.colorTextSecondary }}>Bitrate: <Text strong style={{ color: token.colorText }}>{formatBitrate(bitrate)}</Text></Text>
              <Text style={{ color: token.colorTextSecondary }}>Resolution: <Text strong style={{ color: token.colorText }}>{resolution}</Text></Text>
              <Text style={{ color: token.colorTextSecondary }}>Uptime: <Text strong style={{ color: token.colorText }}>{uptime}s</Text></Text>
            </Space>
          </div>
        )}
    </Card>
  );
};


export default CameraGridItem;