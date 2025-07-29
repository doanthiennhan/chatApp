import React from 'react';
import CameraPlayer from './CameraPlayer';
import JSMpegPlayer from './JSMpegPlayer';
import SpringBootStreamPlayer from './SpringBootStreamPlayer';

const StreamPlayer = ({ 
  camera, 
  selectedCamera, 
  isInModal = false, 
  visible = true, 
  playerType = 'springboot' // 'springboot', 'jsmpeg', 'camera'
}) => {
  switch (playerType) {
    case 'springboot':
      return (
        <SpringBootStreamPlayer
          camera={camera}
          selectedCamera={selectedCamera}
          isInModal={isInModal}
          visible={visible}
        />
      );
    case 'jsmpeg':
      return (
        <JSMpegPlayer
          camera={camera}
          selectedCamera={selectedCamera}
          isInModal={isInModal}
          visible={visible}
        />
      );
    case 'camera':
    default:
      return (
        <CameraPlayer
          camera={camera}
          selectedCamera={selectedCamera}
          isInModal={isInModal}
          visible={visible}
        />
      );
  }
};

export default StreamPlayer; 