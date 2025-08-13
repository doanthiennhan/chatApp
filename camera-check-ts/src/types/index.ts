export interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ERROR';
  type: 'IP' | 'ANALOG';
  vendor: string;
  snapshotUrl?: string;
  hlsUrl?: string;
  viewerCount?: number;
  lastUpdated?: string;
  imageQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  sub?: string; // For JWT subject
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  message: string; // Renamed from content
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdDate: string; // Keep createdDate for consistency with API, but note it's used as timestamp in lastMessage
  me?: boolean; // Indicates if the message was sent by the current user
}

export interface Conversation {
  id: string;
  conversationName: string;
  type: 'DIRECT' | 'GROUP';
  conversationAvatar?: string;
  participants: User[];
  lastMessage?: {
    id: string;
    conversationId: string;
    me: boolean;
    message: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    sender: User;
    createdDate: string;
  };
  unreadCount?: number;
  memberCount?: number;
}

export interface PaginatedMessages {
  data: Message[];
  totalPages: number;
  currentPage: number;
}

export interface RealTimeCameraStatus {
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ERROR';
  viewerCount: number;
  lastUpdated: string;
  name?: string;
  location?: string;
  resolution?: string;
  vendor?: string;
}