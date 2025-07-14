import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import groupReducer from './groupSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    group: groupReducer,
    notification: notificationReducer,
  },
});

export default store; 