import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { io, Socket } from 'socket.io-client';
import { SnackbarProvider } from 'notistack';

// Components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoomListPage from './pages/RoomListPage';
import ProfilePage from './pages/ProfilePage';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { EditorProvider } from './contexts/EditorContext';

// Services
import { API_BASE_URL } from './services/api';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ECDC4',
    },
    secondary: {
      main: '#FF6B6B',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Initialize socket connection
const socket: Socket = io(API_BASE_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Socket connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Connect socket
    socket.connect();

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <AuthProvider>
          <SocketProvider socket={socket}>
            <EditorProvider>
              <Router>
                <div className="App">
                  <Navbar isConnected={isConnected} />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor/:roomId?" element={<EditorPage />} />
                    <Route path="/auth/:mode?" element={<AuthPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/rooms" element={<RoomListPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Router>
            </EditorProvider>
          </SocketProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;