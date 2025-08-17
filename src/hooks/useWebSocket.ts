'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  connectionAttempts: number;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    protocols,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onConnect,
    onDisconnect,
    onError,
    onMessage
  } = options;

  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
    connectionAttempts: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'ping', 
        timestamp: new Date().toISOString() 
      }));
    }
  }, []);

  // Setup heartbeat interval
  const setupHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }
    
    heartbeatTimeoutRef.current = setInterval(sendHeartbeat, heartbeatInterval);
  }, [sendHeartbeat, heartbeatInterval]);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
      connectionAttempts: prev.connectionAttempts + 1
    }));

    try {
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          connectionAttempts: 0
        }));

        setupHeartbeat();
        onConnect?.();
      };

      ws.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));

        clearTimeouts();
        onDisconnect?.();

        // Attempt to reconnect if not manually closed
        if (shouldReconnectRef.current && state.connectionAttempts < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'WebSocket connection error'
        }));

        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle pong responses
          if (message.type === 'pong') {
            return; // Don't update state for pong messages
          }

          setState(prev => ({
            ...prev,
            lastMessage: message
          }));

          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to create WebSocket connection'
      }));
    }
  }, [url, protocols, onConnect, onDisconnect, onError, onMessage, reconnectAttempts, reconnectInterval, setupHeartbeat, state.connectionAttempts]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionAttempts: 0
    }));
  }, [clearTimeouts]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const wsMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      wsRef.current.send(JSON.stringify(wsMessage));
      return true;
    }
    return false;
  }, []);

  // Manually reconnect
  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    setTimeout(() => {
      setState(prev => ({ ...prev, connectionAttempts: 0 }));
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Subscribe to specific message types
  const subscribe = useCallback((messageType: string, callback: (data: any) => void) => {
    const handler = (message: WebSocketMessage) => {
      if (message.type === messageType) {
        callback(message.data);
      }
    };

    // Store the handler for cleanup (in a real implementation, you'd want a proper subscription system)
    return handler;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearTimeouts();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Empty dependency array for mount only

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    subscribe,
    
    // Utilities
    isReady: state.isConnected && !state.isConnecting,
    canReconnect: state.connectionAttempts < reconnectAttempts
  };
};

// Hook for dashboard-specific WebSocket connection
export const useDashboardWebSocket = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [alertsData, setAlertsData] = useState<any[]>([]);

  const websocket = useWebSocket({
    url: process.env.NODE_ENV === 'production' 
      ? 'wss://your-backend-domain.vercel.app/ws' 
      : 'ws://localhost:8000/ws',
    onConnect: () => {
      console.log('Dashboard WebSocket connected');
    },
    onDisconnect: () => {
      console.log('Dashboard WebSocket disconnected');
    },
    onError: (error) => {
      console.error('Dashboard WebSocket error:', error);
    },
    onMessage: (message) => {
      switch (message.type) {
        case 'dashboard_update':
          setDashboardData(message.data);
          break;
        case 'metrics_update':
          setMetricsData(message.data);
          break;
        case 'alert':
          setAlertsData(prev => [...prev.slice(-9), message.data]); // Keep last 10 alerts
          break;
        case 'pain_point_new':
          // Handle new pain point notification
          console.log('New pain point:', message.data);
          break;
        case 'business_idea_generated':
          // Handle new business idea notification
          console.log('New business idea:', message.data);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    }
  });

  // Request initial data
  useEffect(() => {
    if (websocket.isConnected) {
      websocket.sendMessage({ type: 'subscribe', channels: ['dashboard', 'metrics', 'alerts'] });
    }
  }, [websocket.isConnected]);

  return {
    ...websocket,
    dashboardData,
    metricsData,
    alertsData,
    
    // Dashboard-specific actions
    requestMetricsUpdate: () => websocket.sendMessage({ type: 'request_metrics_update' }),
    requestDashboardUpdate: () => websocket.sendMessage({ type: 'request_dashboard_update' }),
    triggerDataCollection: () => websocket.sendMessage({ type: 'trigger_data_collection' })
  };
};