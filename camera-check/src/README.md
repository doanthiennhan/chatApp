# Cấu trúc thư mục src

Dự án React được tổ chức theo cấu trúc chuẩn để dễ bảo trì và mở rộng.

## 📁 Cấu trúc thư mục

```
src/
├── assets/                    # Tài nguyên tĩnh (images, icons, fonts)
├── components/                # Components tái sử dụng
│   ├── common/               # Components chung (Button, Input, Modal, etc.)
│   ├── camera/               # Components liên quan đến camera
│   │   ├── CameraCard.jsx
│   │   ├── CameraModal.jsx
│   │   ├── CameraPlayer.jsx
│   │   ├── CreateCameraModal.jsx
│   │   ├── HLSPlayer.jsx
│   │   ├── JSMpegPlayer.jsx
│   │   ├── SimpleJSMpegDemo.jsx
│   │   ├── StreamPlayer.jsx
│   │   └── StreamMetadata.jsx
│   ├── chat/                 # Components liên quan đến chat
│   │   ├── AlertItem.jsx
│   │   ├── ChatArea.jsx
│   │   ├── FindGroup.jsx
│   │   └── GroupChannelManagement.jsx
│   ├── auth/                 # Components liên quan đến authentication
│   │   ├── ProtectedRoute.jsx
│   │   └── GuestRoute.jsx
│   └── layout/               # Components layout
│       ├── MainLayout.jsx
│       └── Sidebar.jsx
├── pages/                    # Pages/Views
│   ├── Camera.jsx
│   ├── Chat.jsx
│   ├── Dashboard.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── NotFound.jsx
│   ├── Profile.jsx
│   └── Register.jsx
├── hooks/                    # Custom hooks
│   └── useCameraHealthSSE.js
├── services/                 # API services
│   ├── cameraService.js
│   ├── chatService.js
│   ├── identityService.js
│   └── userService.js
├── store/                    # Redux store
│   ├── slices/               # Redux slices
│   │   ├── cameraSlice.js
│   │   └── chatSlice.js
│   └── index.js              # Store configuration
├── utils/                    # Utility functions
│   └── index.js
├── constants/                # Constants và configurations
│   └── index.js
├── styles/                   # Global styles
│   ├── App.css
│   └── index.css
├── types/                    # TypeScript types (nếu sử dụng TS)
├── App.jsx                   # Root component
└── main.jsx                  # Entry point
```

## 🎯 Nguyên tắc tổ chức

### 1. **Components**
- **common/**: Components có thể tái sử dụng ở nhiều nơi (Button, Input, Modal, etc.)
- **camera/**: Tất cả components liên quan đến camera
- **chat/**: Tất cả components liên quan đến chat
- **auth/**: Components liên quan đến authentication
- **layout/**: Components layout chung

### 2. **Pages**
- Mỗi route chính có một page riêng
- Pages chỉ chứa logic tổ chức layout và kết nối data
- Không chứa business logic phức tạp

### 3. **Services**
- Tất cả API calls được tập trung trong thư mục services
- Mỗi domain có một service riêng (cameraService, chatService, etc.)

### 4. **Store**
- Redux store được tổ chức theo slices
- Mỗi feature có một slice riêng
- Store configuration ở index.js

### 5. **Utils & Constants**
- **utils/**: Các hàm tiện ích có thể tái sử dụng
- **constants/**: Các hằng số, cấu hình của ứng dụng

## 🔄 Quy tắc import

### Import Components
```javascript
// Từ pages
import CameraCard from "../components/camera/CameraCard";
import ChatArea from "../components/chat/ChatArea";

// Từ components
import ProtectedRoute from "../../components/auth/ProtectedRoute";
```

### Import Services
```javascript
import { fetchCameras } from "../services/cameraService";
import { signin } from "../services/identityService";
```

### Import Store
```javascript
import { deleteCamera } from "../store/slices/cameraSlice";
```

### Import Utils & Constants
```javascript
import { isTokenValid, formatDate } from "../utils";
import { ROUTES, CAMERA_TYPES } from "../constants";
```

## 📝 Best Practices

1. **Naming Convention**: Sử dụng PascalCase cho components, camelCase cho functions
2. **File Organization**: Mỗi component một file riêng
3. **Import Paths**: Sử dụng relative paths từ vị trí file hiện tại
4. **Code Splitting**: Tổ chức code theo feature để dễ maintain
5. **Consistency**: Giữ nhất quán trong cách đặt tên và cấu trúc

## 🚀 Mở rộng

Khi thêm tính năng mới:
1. Tạo thư mục mới trong components/ nếu cần
2. Thêm service mới trong services/
3. Tạo slice mới trong store/slices/ nếu cần state management
4. Cập nhật constants nếu có hằng số mới 