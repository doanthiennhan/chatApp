import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchCameras, deleteCamera as apiDeleteCamera, updateCamera as apiUpdateCamera, createCamera as apiCreateCamera } from '../../services/cameraService';
import { Camera, RealTimeCameraStatus } from '../../types';

interface CameraState {
  list: Camera[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  activeStreamIds: string[];
  editingCameraId: string | null;
  healthStatus: Record<string, any>; // Consider defining a specific type for health data
  displayedCameraIds: string[];
  realTimeStatus: Record<string, RealTimeCameraStatus>;
}

const initialState: CameraState = {
  list: [],
  status: 'idle',
  error: null,
  activeStreamIds: [],
  editingCameraId: null,
  healthStatus: {},
  displayedCameraIds: JSON.parse(localStorage.getItem('displayedCameraIds') || '[]'),
  realTimeStatus: {},
};

// Async thunks remain the same as you provided
export const getCameras = createAsyncThunk<Camera[]>(
  'camera/getCameras',
  async (_, { rejectWithValue }) => {
    try {
      const apiRes = await fetchCameras();
      return (apiRes?.data?.data || apiRes?.data || []) as Camera[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCamera = createAsyncThunk<Camera, Omit<Camera, 'id'>>(
  'camera/createCamera',
  async (cameraData, { rejectWithValue }) => {
    try {
      return await apiCreateCamera(cameraData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteCamera = createAsyncThunk<string, string>(
  'camera/deleteCamera',
  async (id, { rejectWithValue }) => {
    try {
      await apiDeleteCamera(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCamera = createAsyncThunk<Camera, Camera>(
  'camera/updateCamera',
  async (cameraData, { rejectWithValue }) => {
    try {
      return await apiUpdateCamera(cameraData);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    startStreaming: (state, action: PayloadAction<string>) => {
      if (!state.activeStreamIds.includes(action.payload)) {
        state.activeStreamIds.push(action.payload);
      }
    },
    stopStreaming: (state, action: PayloadAction<string>) => {
      state.activeStreamIds = state.activeStreamIds.filter(id => id !== action.payload);
    },
    updateCameraHealth: (state, action: PayloadAction<{ cameraId: string; healthData: any }>) => {
      state.healthStatus[action.payload.cameraId] = action.payload.healthData;
    },
    updateCameraStatus: (state, action: PayloadAction<RealTimeCameraStatus & { cameraId: string }>) => {
      const { cameraId, ...statusUpdate } = action.payload;
      state.realTimeStatus[cameraId] = { ...state.realTimeStatus[cameraId], ...statusUpdate, lastUpdated: new Date().toISOString() };
      const cameraIndex = state.list.findIndex(cam => cam.id === cameraId);
      if (cameraIndex !== -1) {
        state.list[cameraIndex] = { ...state.list[cameraIndex], ...statusUpdate };
      }
    },
    addDisplayedCamera: (state, action: PayloadAction<string>) => {
      if (!state.displayedCameraIds.includes(action.payload)) {
        state.displayedCameraIds.push(action.payload);
        localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
      }
    },
    removeDisplayedCamera: (state, action: PayloadAction<string>) => {
      state.displayedCameraIds = state.displayedCameraIds.filter(id => id !== action.payload);
      localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
    },
    setDisplayedCameras: (state, action: PayloadAction<string[]>) => {
      state.displayedCameraIds = action.payload;
      localStorage.setItem('displayedCameraIds', JSON.stringify(state.displayedCameraIds));
    },
    setEditingCameraId: (state, action: PayloadAction<string | null>) => {
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
      .addCase(getCameras.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(getCameras.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(createCamera.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.list = state.list.filter(cam => cam.id !== action.payload);
      })
      .addCase(updateCamera.fulfilled, (state, action) => {
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