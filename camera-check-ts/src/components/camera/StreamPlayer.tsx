import React from 'react';
import SpringBootStreamPlayer from './SpringBootStreamPlayer';
import { Camera } from '../../types';

interface StreamPlayerProps {
  camera: Camera;
  selectedCamera?: Camera;
  isInModal?: boolean;
  visible?: boolean;
  playerType?: 'springboot' | 'jsmpeg' | 'camera';
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({
  camera,
  selectedCamera,
  isInModal = false,
  visible = true,
  playerType = 'springboot'
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
    // Các loại player khác (JSMpeg, WebRTC) có thể được thêm vào đây nếu cần
    // case 'jsmpeg':
    //   return (
    //     <JSMpegPlayer
    //       camera={camera}
    //       selectedCamera={selectedCamera}
    //       isInModal={isInModal}
    //       visible={visible}
    //     />
    //   );
    // case 'camera':
    // default:
    //   return (
    //     <CameraPlayer
    //       camera={camera}
    //       selectedCamera={selectedCamera}
    //       isInModal={isInModal}
    //       visible={visible}
    //     />
    //   );
    default:
      return <div>Chọn loại player không hợp lệ.</div>;
  }
};

export default StreamPlayer;