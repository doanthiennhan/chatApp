// Canvas utility functions

export const testCanvasRef = (canvasRef) => {
  if (!canvasRef || !canvasRef.current) {
    console.warn('🔧 Canvas ref is not available');
    return false;
  }

  try {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('🔧 Cannot get 2D context from canvas');
      return false;
    }

    // Test drawing
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log('🔧 Canvas test successful');
    return true;
  } catch (error) {
    console.error('🔧 Canvas test failed:', error);
    return false;
  }
};

export const waitForCanvasRef = (canvasRef, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCanvas = () => {
      if (canvasRef && canvasRef.current) {
        resolve(canvasRef.current);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Canvas ref timeout'));
        return;
      }
      
      setTimeout(checkCanvas, 100);
    };
    
    checkCanvas();
  });
};

export const resizeCanvas = (canvas, width, height) => {
  if (!canvas) return;
  
  try {
    canvas.width = width;
    canvas.height = height;
    console.log('🔧 Canvas resized to:', width, 'x', height);
  } catch (error) {
    console.error('🔧 Failed to resize canvas:', error);
  }
};

export const clearCanvas = (canvas) => {
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('🔧 Failed to clear canvas:', error);
  }
}; 