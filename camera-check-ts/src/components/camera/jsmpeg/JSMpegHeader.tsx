import React from 'react';
import { Badge } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Camera } from '../../../types';

interface JSMpegHeaderProps {
  camera: Camera;
  viewerCount: number;
}

const JSMpegHeader: React.FC<JSMpegHeaderProps> = ({ camera, viewerCount }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>{camera?.name || t('unknown_camera')} - {t('live_view')} 📹</span>
      <Badge count={viewerCount} showZero>
        <EyeOutlined style={{ fontSize: 20, color: "#1677ff" }} />
      </Badge>
    </div>
  );
};

export default JSMpegHeader;