import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCameras, deleteCamera as apiDeleteCamera, updateCamera as apiUpdateCamera, createCamera as apiCreateCamera } from '../../services/cameraService';

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
  async (cameraData, { rejectWithValue }) => {
    try {
      const data = await apiUpdateCamera(cameraData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const cameraSlice = createSlice({
  name: 'camera',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
    selectedCameraId: null,
    editingCameraId: null,
  },
  reducers: {
    setSelectedCameraId: (state, action) => {
      state.selectedCameraId = action.payload;
    },
    clearSelectedCameraId: (state) => {
      state.selectedCameraId = null;
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
      .addCase(getCameras.fulfilled, (state, action) => {
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
      .addCase(createCamera.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Xử lý xóa camera
      .addCase(deleteCamera.fulfilled, (state, action) => {
        state.list = state.list.filter(cam => cam.id !== action.payload);
      })
      // Xử lý sửa camera
      .addCase(updateCamera.fulfilled, (state, action) => {
        const idx = state.list.findIndex(cam => cam.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      });
  },
});

export const { setSelectedCameraId, clearSelectedCameraId, setEditingCameraId, clearEditingCameraId } = cameraSlice.actions;

export default cameraSlice.reducer;