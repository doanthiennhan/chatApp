/* // JSMpeg utility functions

export const checkJSMpegAvailability = () => {
  return typeof window !== 'undefined' && window.JSMpeg && window.JSMpeg.Player;
};

export const createJSMpegPlayer = (canvas, url, options = {}) => {
  if (!checkJSMpegAvailability()) {
    console.error('🔧 JSMpeg is not available');
    return null;
  }

  try {
    const defaultOptions = {
      autoplay: true,
      audio: false,
      loop: false,
      videoBufferSize: 1024 * 1024, // 1MB buffer
      ...options
    };

    const player = new window.JSMpeg.Player(url, {
      canvas: canvas,
      ...defaultOptions
    });

    console.log('🔧 JSMpeg player created successfully');
    return player;
  } catch (error) {
    console.error('🔧 Failed to create JSMpeg player:', error);
    return null;
  }
};

export const destroyJSMpegPlayer = (player) => {
  if (player && typeof player.destroy === 'function') {
    try {
      player.destroy();
      console.log('🔧 JSMpeg player destroyed successfully');
    } catch (error) {
      console.error('🔧 Error destroying JSMpeg player:', error);
    }
  }
};

export const loadJSMpegScript = () => {
  return new Promise((resolve, reject) => {
    if (checkJSMpegAvailability()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsmpeg-player@5.0.3/build/JSMpeg.min.js';
    script.onload = () => {
      console.log('🔧 JSMpeg script loaded successfully');
      // Wait a bit for the script to initialize
      setTimeout(() => {
        if (checkJSMpegAvailability()) {
          resolve();
        } else {
          reject(new Error('JSMpeg loaded but not available'));
        }
      }, 100);
    };
    script.onerror = () => {
      console.error('🔧 Failed to load JSMpeg script');
      reject(new Error('Failed to load JSMpeg script'));
    };
    document.head.appendChild(script);
  });
};

export const waitForJSMpeg = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkJSMpeg = () => {
      if (checkJSMpegAvailability()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('JSMpeg timeout'));
        return;
      }
      
      setTimeout(checkJSMpeg, 100);
    };
    
    checkJSMpeg();
  });
}; */