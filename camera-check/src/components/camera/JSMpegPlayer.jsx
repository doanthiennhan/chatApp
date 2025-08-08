/* import React, { useRef } from 'react';
import { Card } from 'antd';
import { useJSMpegStream } from './jsmpeg';
import JSMpegHeader from './jsmpeg/JSMpegHeader';
import JSMpegControls from './jsmpeg/JSMpegControls';
import JSMpegVideoPlayer from './jsmpeg/JSMpegVideoPlayer';
import JSMpegStreamInfo from './jsmpeg/JSMpegStreamInfo';
import JSMpegCameraDetails from './jsmpeg/JSMpegCameraDetails';
import JSMpegMetadata from './jsmpeg/JSMpegMetadata';

const JSMpegPlayer = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const canvasRef = useRef(null);

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
    handleStartStream(canvasRef);
  };

  const onStopStream = () => {
    handleStopStream();
  };

  return (
    <Card
      title={
        <JSMpegHeader
          camera={currentCamera}
          connectionStatus={connectionStatus}
          viewerCount={viewerCount}
          isStreaming={isStreaming}
          loading={loading}
          onStartStream={onStartStream}
          onStopStream={onStopStream}
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
      <JSMpegVideoPlayer
        connectionStatus={connectionStatus}
        canvasRef={canvasRef}
      />
      
      {/* Real-time metadata from Backend */}
      <JSMpegMetadata 
        streamMetadata={streamMetadata} 
        camera={currentCamera}
        connectionStatus={connectionStatus}
      />
      
      <JSMpegStreamInfo streamInfo={streamInfo} />
      
      <JSMpegCameraDetails camera={currentCamera} />
    </Card>
  );
};

export default JSMpegPlayer; */