import React, { useRef } from 'react';
import { Card } from 'antd';
import { useJSMpegStream } from './jsmpeg';
import JSMpegHeader from './jsmpeg/JSMpegHeader';
import JSMpegControls from './jsmpeg/JSMpegControls';
import JSMpegVideoPlayer from './jsmpeg/JSMpegVideoPlayer';
import JSMpegStreamInfo from './jsmpeg/JSMpegStreamInfo';
import JSMpegCameraDetails from './jsmpeg/JSMpegCameraDetails';
import JSMpegMetadata from './jsmpeg/JSMpegMetadata';
import { Camera } from '../../types';
import { StreamInfo as JSMpegStreamInfoType } from './jsmpeg/jsmpegUtils';

interface JSMpegPlayerProps {
  camera: Camera;
  selectedCamera?: Camera;
  isInModal?: boolean;
  visible?: boolean;
}

const JSMpegPlayer: React.FC<JSMpegPlayerProps> = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentCamera = selectedCamera || camera;

  const {
    isStreaming,
    loading,
    connectionStatus,
    streamInfo,
    streamMetadata,
    viewerCount,
    handleStartStream,
    handleStopStream
  } = useJSMpegStream(currentCamera, isInModal, visible);

  const onStartStream = () => {
    if (canvasRef.current) {
      handleStartStream(canvasRef);
    }
  };

  const onStopStream = () => {
    handleStopStream();
  };

  return (
    <Card
      title={
        <JSMpegHeader
          camera={currentCamera}
          viewerCount={viewerCount}
        />
      }
      extra={
        <JSMpegControls
          connectionStatus={connectionStatus}
          isStreaming={isStreaming}
          loading={loading}
          onStartStream={onStartStream}
          onStopStream={onStopStream}
        />
      }
      style={{ width: "100%", marginBottom: 16 }}
    >
      {canvasRef.current && (
        <JSMpegVideoPlayer
          connectionStatus={connectionStatus}
          canvasRef={canvasRef}
        />
      )}
      
      {/* Real-time metadata from Backend */}
      <JSMpegMetadata 
        streamMetadata={streamMetadata} 
        camera={currentCamera}
        connectionStatus={connectionStatus}
      />
      
      <JSMpegStreamInfo streamInfo={streamInfo as JSMpegStreamInfoType} />
      
      <JSMpegCameraDetails camera={currentCamera} />
    </Card>
  );
};

export default JSMpegPlayer;
