import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
const SocketContext = createContext(null);
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState(null);
  // Get Zustand Actions
  const {
    setMe,
    setActiveUsers,
    addUser,
    removeUser,
    updateCursor,
    removeCursor,
    setMessages,
    addMessage,
    setTypingStatus,
    setActivities,
    addActivity,
    updateSharedObject,
    setCounter,
    setTheme,
    setVotes,
  } = useStore();
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  useEffect(() => {
    let activeSocket = null;
    const initConnection = async () => {
      try {
        let token = localStorage.getItem('LiveSpace_guest_token');
        let localUser = null;
        if (localStorage.getItem('LiveSpace_guest_user')) {
          try {
            localUser = JSON.parse(localStorage.getItem('LiveSpace_guest_user'));
          } catch (_) {}
        }

        if (!token || !localUser) {
          const res = await axios.post(`${SERVER_URL}/api/auth/guest`);
          token = res.data.token;
          localUser = res.data.user;
          localStorage.setItem('LiveSpace_guest_token', token);
          localStorage.setItem('LiveSpace_guest_user', JSON.stringify(localUser));
        }
        setMe(localUser);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const [msgRes, actRes, objRes] = await Promise.all([
            axios.get(`${SERVER_URL}/api/messages`),
            axios.get(`${SERVER_URL}/api/activities`),
          ]);
          setMessages(msgRes.data);
          setActivities(actRes.data);
        } catch (err) {
          console.warn('Failed to load REST history, using socket sync defaults instead:', err.message);
        }
        // 4. Connect WebSockets
        const socket = io(SERVER_URL, {
          auth: { token },
          transports: ['websocket', 'polling']
        });
        socketRef.current = socket;
        activeSocket = socket;
        // 5. Register Socket Event Listeners
        socket.on('connect', () => {
          setConnected(true);
          setAuthError(null);
          toast.success('Connected to LiveSpace Live Engine', {
            style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          });
        });
        socket.on('connect_error', (err) => {
          console.error('Socket connect error:', err);
          setConnected(false);
          if (err.message.includes('Authentication error')) {
            setAuthError(err.message);
            // Clear credentials to re-register guest on next try
            localStorage.removeItem('LiveSpace_guest_token');
            localStorage.removeItem('LiveSpace_guest_user');
          }
        });
        socket.on('disconnect', () => {
          setConnected(false);
        });
        // Sync initial state on join
        socket.on('session:init', (data) => {
          setMe(data.user);
          setCounter(data.globalCounter);
          setTheme(data.globalTheme);
          setVotes(data.globalVotes);
          setActiveUsers(data.activeUsers);
          
          // Trigger canvas history setup locally (handled inside canvas component)
          window.dispatchEvent(new CustomEvent('canvas:sync_history', { detail: data.canvasHistory }));
        });
        // Collaborators joins/leaves
        socket.on('user:joined', (user) => {
          addUser(user);
          toast(`${user.username} entered the space`, {
            icon: '👋',
            style: { background: '#0f172a', color: '#cbd5e1', border: '1px solid #1e293b' }
          });
        });
        socket.on('user:left', (socketId) => {
          removeUser(socketId);
          removeCursor(socketId);
        });
        // Real-time cursor coordinates
        socket.on('cursor:update', (cursor) => {
          updateCursor(cursor.socketId, cursor);
        });
        // Chat messages
        socket.on('chat:message', (msg) => {
          addMessage(msg);
        });
        // Typing updates
        socket.on('typing:update', ({ username, isTyping }) => {
          setTypingStatus(username, isTyping);
        });
        // Activity log stream
        socket.on('activity:new', (activity) => {
          addActivity(activity);
        });
        // Shared features counter
        socket.on('counter:updated', (newVal) => {
          setCounter(newVal);
        });
        // Shared voting counts
        socket.on('vote:updated', (updatedVotes) => {
          setVotes(updatedVotes);
        });
        // Shared floating reactions
        socket.on('reaction:receive', (data) => {
          window.dispatchEvent(new CustomEvent('reaction:receive_custom', { detail: data }));
        });
        // Global cooperative theme toggle
        socket.on('theme:updated', (updatedTheme) => {
          setTheme(updatedTheme);
        });
        // Shared drawing canvas events (canvas strokes and clear hooks are captured in CustomEvents)
        socket.on('canvas:draw', (stroke) => {
          window.dispatchEvent(new CustomEvent('canvas:draw_stroke', { detail: stroke }));
        });
        socket.on('canvas:clear', () => {
          window.dispatchEvent(new CustomEvent('canvas:clear_canvas'));
        });
      } catch (err) {
        console.error('Failed to initialize socket flow:', err);
        setAuthError(err.message);
      }
    };
    initConnection();
    return () => {
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, []);
  // Event dispatchers
  const sendCursorMove = (coords) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('cursor:move', coords);
    }
  };
  const sendReaction = (emoji) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('reaction:send', emoji);
    }
  };
  const sendMessage = (text) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('chat:message', text);
    }
  };
  const sendTypingStart = () => {
    if (socketRef.current && connected) {
      socketRef.current.emit('typing:start');
    }
  };
  const sendTypingStop = () => {
    if (socketRef.current && connected) {
      socketRef.current.emit('typing:stop');
    }
  };
  const updateCounter = (delta) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('counter:update', delta);
    }
  };
  const moveObject = (objectId, x, y, rotation) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('object:move', { objectId, x, y, rotation });
    }
  };
  const drawOnCanvas = (strokeData) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('canvas:draw', strokeData);
    }
  };
  const clearCanvas = () => {
    if (socketRef.current && connected) {
      socketRef.current.emit('canvas:clear');
    }
  };
  const castVote = (optionId) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('vote:cast', optionId);
    }
  };

  const toggleTheme = (newTheme) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('theme:toggle', newTheme);
    }
  };
  const value = {
    connected,
    authError,
    socket: socketRef.current,
    sendCursorMove,
    sendReaction,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    updateCounter,
    moveObject,
    drawOnCanvas,
    clearCanvas,
    castVote,
    toggleTheme
  };
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
