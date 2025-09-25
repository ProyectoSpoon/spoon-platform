// types/connections.ts
export enum ConnectionStatus {
    CONNECTED = 'connected',
    PENDING = 'pending',
    SUGGESTED = 'suggested',
  }
  
  export interface User {
    id: string;
    name: string;
    avatar: string;
    location: string;
    sharedInterests: string[];
    lastActive: Date;
    status: ConnectionStatus;
    sharedReviews?: number;
    connectionDate?: Date;
    compatibility?: number;
    favoriteRestaurants?: number;
    requestDate?: Date;
    message?: string;
    requestType?: 'received' | 'sent';
  }
  
  export interface ConnectionScreenState {
    activeTab: number;
    searchQuery: string;
    allowConnections: boolean;
    showActivity: boolean;
    connectionNotifications: boolean;
    connectionByLocation: boolean;
    connectionByInterests: boolean;
    connectionRadius: number;
    connections: User[];
    pendingRequests: User[];
    suggestions: User[];
    blockedUsers: User[];
  }