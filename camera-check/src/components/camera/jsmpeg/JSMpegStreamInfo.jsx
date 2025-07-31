import React from 'react';
import { Descriptions } from 'antd';
import dayjs from 'dayjs';

const JSMpegStreamInfo = ({ streamInfo }) => {
  if (!streamInfo) return null;

  return (
    <Descriptions 
      title="Stream Information" 
      size="small" 
      column={2} 
      style={{ marginTop: 16 }}
      bordered
    >
      <Descriptions.Item label="Video Codec">{streamInfo.videoCodec || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Audio Codec">{streamInfo.audioCodec || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Resolution">{streamInfo.resolution || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Frame Rate">{streamInfo.frameRate || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Bitrate">{streamInfo.bitRate || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Format">{streamInfo.format || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Last Updated" span={2}>
        {streamInfo.updatedAt ? dayjs(streamInfo.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default JSMpegStreamInfo; 