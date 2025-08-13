import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCameras, deleteCamera as apiDeleteCamera, updateCamera as apiUpdateCamera, createCamera as apiCreateCamera } from '../../services/cameraService';
import "../types"; // Import JSDoc types

/**
 * @typedef {object} CameraState
 * @property {Camera[]} list
 * @property {'idle' | 'loading' | 'succeeded' | 'failed'} status
 * @property {string | null} error
 * @property {string[]} activeStreamIds
 * @property {string | null} editingCameraId
 * @property {object} healthStatus
 * @property {string[]} displayedCameraIds
 * @property {Object.<string, CameraStatusUpdate>} realTimeStatus
 */

// Async thunk để fetch danh sách camera
export const getCameras = createAsyncThunk(
  'camera/getCameras',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCameras();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk để tạo camera
export const createCamera = createAsyncThunk(
  'camera/createCamera',
  /** @param {Camera} cameraData */
  async (cameraData, { rejectWithValue }) => {
    try {
      const data = await apiCreateCamera(cameraData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk để xóa camera
export const deleteCamera = createAsyncThunk(
  'camera/deleteCamera',
  async (id, { rejectWithValue }) => {
    try {
      await apiDeleteCamera(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk để sửa camera
export const updateCamera = createAsyncThunk(
  'camera/updateCamera',
  /** @param {Camera} cameraData */
  async (cameraData, { rejectWithValue }) => {
    try {
      const data = await apiUpdateCamera(cameraData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/** @type {CameraState} */
const initialState = {
  list: [],
  status: 'idle',
  error: null,
  activeStreamIds: [], 
  editingCameraId: null,
  healthStatus: {}, 
  displayedCameraIds: JSON.parse(localStorage.getItem('displayedCameraIds')) || [],
  realTimeStatus: {},
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    startStreaming: (state, action) => {
      if (!state.activeStreamIds.includes(action.payload)) {
        state.activeStreamIds.push(action.payload);
      }
    },
    stopStreaming: (state, action) => {
      state.activeStreamIds = state.activeStreamIds.filter(
        id => id !== action.payload
      );
    },
    updateCameraHealth: (state, action) => {
      const { cameraId, healthData } = action.payload;
      state.healthStatus[cameraId] = healthData;
    },
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<CameraStatusUpdate>} action
     */
    updateCameraStatus: (state, action) => {
      const { cameraId, status, viewerCount, name, location, resolution, vendor } = action.payload;
      
      // Cập nhật realTimeStatus
      state.realTimeStatus[cameraId] = {
        status,
        viewerCount,
        lastUpdated: new Date().toISOString()
      };

      // Cập nhật camera trong list nếu có
      const cameraIndex = state.list.findIndex(cam => cam.id === cameraId);
      if (cameraIndex !== -1) {
        state.list[cameraIndex] = {
          ...state.list[cameraIndex],
          status,
          viewerCount,
          name: name || state.list[cameraIndex].name,
          location: location || state.list[cameraIndex].location,
          resolution: resolution || state.list[cameraIndex].resolution,
          vendor: vendor || state.list[cameraIndex].vendor,
          lastUpdated: new Date().toISOString()
        };
      }
    },
    // Reducers mới để quản lý danh sách camera hiển thị
    addDisplayedCamera: (state, action) => {
      if (!state.displayedCameraIds.includes(action.payload)) {
        state.displayedCameraIds.push(action.payload);
        localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
      }
    },
    removeDisplayedCamera: (state, action) => {
      state.displayedCameraIds = state.displayedCameraIds.filter(
        id => id !== action.payload
      );
      localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
    },
    setDisplayedCameras: (state, action) => {
      state.displayedCameraIds = action.payload;
      localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
    },
    setEditingCameraId: (state, action) => {
      state.editingCameraId = action.payload;
    },
    clearEditingCameraId: (state) => {
      state.editingCameraId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCameras.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getCameras.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<{data: {data: Camera[]}}>} action */
        (state, action) => {
        state.status = 'succeeded';
        // Correctly extract the data array and add lastUpdated property as ISO string
        state.list = (action.payload?.data?.data || []).map(cam => ({
          ...cam,
          lastUpdated: new Date().toISOString(), // Convert to ISO string
          imageQuality: cam.resolution ? "excellent" : "good", // Ensure imageQuality is set
        }));
      })
      .addCase(getCameras.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createCamera.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<Camera>} action */
        (state, action) => {
        state.list.push(action.payload);
      })
      // Xử lý xóa camera
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.list = state.list.filter(cam => cam.id !== action.payload);
      })
      // Xử lý sửa camera
      .addCase(updateCamera.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<Camera>} action */
        (state, action) => {
        const idx = state.list.findIndex(cam => cam.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      });
  },
});

export const { 
  startStreaming,
  stopStreaming,
  updateCameraHealth,
  updateCameraStatus,
  addDisplayedCamera,
  removeDisplayedCamera,
  setDisplayedCameras,
  setEditingCameraId, 
  clearEditingCameraId 
} = cameraSlice.actions;

export default cameraSlice.reducer;