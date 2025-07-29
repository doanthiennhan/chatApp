import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

const HlsPlayer = ({ src }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (!src) return; // Không render nếu không có src

    let hls;
    try {
      if (videoRef.current) {
        if (Hls.isSupported()) {
          hls = new Hls({
            liveSyncDurationCount: 2,  // Giữ số lượng segment ít để giảm độ trễ
            maxLiveSyncPlaybackRate: 1.5,  // Cho phép tỷ lệ phát lại nhanh hơn để đồng bộ nhanh
            maxBufferLength: 5,  // Giảm độ dài bộ đệm tối đa
            maxMaxBufferLength: 10,  // Giảm độ dài bộ đệm tổng thể để tiết kiệm bộ nhớ
            enableWorker: true,  // Kích hoạt worker để cải thiện hiệu suất
            lowLatencyMode: true,  // Chế độ độ trễ thấp cho phát trực tiếp
            autoStartLoad: true,  // Tự động tải video khi có nguồn
            backBufferLength: 10,  // Giữ bộ đệm phía sau ngắn
            startLevel: -1,  // Bắt đầu ở mức tốt nhất có thể
            initialLiveManifestSize: 1,  // Đảm bảo tải 1 segment ngay từ đầu
          });
          hls.loadSource(src);  // URL của stream M3U8
          hls.attachMedia(videoRef.current);
      
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current.play().catch(console.error);  // Phát video ngay khi stream sẵn sàng
          });
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          // Cho các trình duyệt hỗ trợ HLS natively như Safari
          videoRef.current.src = src;
          videoRef.current.addEventListener("loadedmetadata", () => {
            videoRef.current.play().catch(console.error);
          });
        }
      }
    } catch (err) {
      console.error("HLSPlayer error:", err);
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  if (!src) return <div>Không có luồng video</div>;

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted={false} // Đảm bảo không tắt tiếng
      style={{ width: "100%", maxHeight: "500px" }}
    />
  );
};

export default HlsPlayer;