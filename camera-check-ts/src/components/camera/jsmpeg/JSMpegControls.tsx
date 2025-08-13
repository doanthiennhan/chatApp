import React from 'react';
import { Button, Badge } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getStatusColor, getStatusText } from './jsmpegUtils';
import { useTranslation } from 'react-i18next';

interface JSMpegControlsProps {
  connectionStatus: string;
  isStreaming: boolean;
  loading: boolean;
  onStartStream: () => void;
  onStopStream: () => void;
}

const JSMpegControls: React.FC<JSMpegControlsProps> = ({ connectionStatus, isStreaming, loading, onStartStream, onStopStream }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge status={getStatusColor(connectionStatus)} text={getStatusText(connectionStatus, t)} />
      {!isStreaming ? (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={onStartStream}
          loading={loading}
        >
          {t('start_stream')}
        </Button>
      ) : (
        <Button
          danger
          icon={<StopOutlined />}
          onClick={onStopStream}
          loading={loading}
        >
          {t('stop_stream')}
        </Button>
      )}
    </div>
  );
};

export default JSMpegControls;