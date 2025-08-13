import JSMpeg from '@cycjimmy/jsmpeg-player';

// WebGL support check utility

export const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

export const getJSMpegOptions = (canvas, url, customOptions = {}) => {
  const baseOptions = {
    canvas: canvas,
    autoplay: true,
    audio: false,
    loop: false,
    videoBufferSize: 1024 * 1024, // 1MB buffer
    ...customOptions
  };

  // Check if WebGL is supported
  if (!checkWebGLSupport()) {
    console.log('🔧 WebGL not supported, using canvas fallback');
    return {
      ...baseOptions,
      disableWebAssembly: true,
      disableGl: true,
      renderer: 'canvas'
    };
  }

  // If WebGL is supported but we want to force canvas rendering for stability
  return {
    ...baseOptions,
    disableWebAssembly: true,
    disableGl: true,
    renderer: 'canvas'
  };
};

export const createSafeJSMpegPlayer = (url, canvas, options = {}) => {
  try {
    const safeOptions = getJSMpegOptions(canvas, url, options);
    return new JSMpeg.Player(url, safeOptions);
  } catch (error) {
    console.error('🔧 Failed to create JSMpeg player:', error);
    return null;
  }
};