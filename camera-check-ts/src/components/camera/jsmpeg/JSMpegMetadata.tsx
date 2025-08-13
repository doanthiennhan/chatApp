import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import { CameraOutlined, VideoCameraOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { formatBitrate, formatTimestamp } from './jsmpegUtils';
import { Camera } from '../../../types';

interface JSMpegMetadataProps {
  streamMetadata: any;
  camera: Camera;
  connectionStatus: string;
}

const JSMpegMetadata: React.FC<JSMpegMetadataProps> = ({ streamMetadata, camera, connectionStatus }) => {
  if (!streamMetadata) {
    // Show placeholder when no metadata is available
    if (connectionStatus === 'connected') {
      return (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CameraOutlined style={{ color: '#1677ff' }} />
              <span>📷 Camera {camera?.id}</span>
            </div>
          }
          size="small"
          style={{ marginTop: 16 }}
          bordered
        >
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#666',
            fontSize: '14px'
          }}>
            <div>📊 Waiting for stream metadata...</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              Metadata will appear here when available from Backend
            </div>
          </div>
        </Card>
      );
    }
    return null;
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CameraOutlined style={{ color: '#1677ff' }} />
          <span>📷 Camera {streamMetadata.cameraId}</span>
        </div>
      }
      size="small"
      style={{ marginTop: 16 }}
      bordered
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item 
          label={
            <span>
              <VideoCameraOutlined style={{ marginRight: 4 }} />
              Resolution
            </span>
          }
        >
          <Tag color="blue">{streamMetadata.resolution}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <span>
              <VideoCameraOutlined style={{ marginRight: 4 }} />
              FPS
            </span>
          }
        >
          <Tag color="green">{streamMetadata.fps}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <span>
              <VideoCameraOutlined style={{ marginRight: 4 }} />
              Bitrate
            </span>
          }
        >
          <Tag color="orange">{formatBitrate(streamMetadata.bitrate_kbps)}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item 
          label={
            <span>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              Time
            </span>
          }
        >
          <Tag color="purple">{formatTimestamp(streamMetadata.timestamp)}</Tag>
        </Descriptions.Item>
      </Descriptions>
      
      <div style={{ 
        marginTop: 12, 
        padding: 8, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 4,
        fontSize: 12,
        color: '#666'
      }}>
        <strong>📊 Real-time Stream Metrics</strong>
        <br />
        Camera ID: {streamMetadata.cameraId} | 
        Timestamp: {new Date(streamMetadata.timestamp).toISOString()}
      </div>
    </Card>
  );
};

export default JSMpegMetadata;