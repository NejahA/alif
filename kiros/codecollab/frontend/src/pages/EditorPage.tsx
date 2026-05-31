import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Code as CodeIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  PlayArrow as RunIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  SmartToy as AIIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ExitToApp as ExitIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useEditor } from '../contexts/EditorContext';

// Components
import UserCursor from '../components/UserCursor';
import ChatMessage from '../components/ChatMessage';
import AIAssistant from '../components/AIAssistant';

// Services
import { formatBytes, formatTime } from '../utils/formatters';

const EditorPage: React.FC = () => {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  // Context
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();
  const { 
    code, 
    language, 
    setCode, 
    setLanguage, 
    cursorPosition, 
    setCursorPosition,
    users,
    messages,
    aiResponses
  } = useEditor();
  
  // State
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [roomName, setRoomName] = useState('Untitled Room');
  const [isLoading, setIsLoading] = useState(true);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  
  // Refs
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const aiContainerRef = useRef<HTMLDivElement>(null);
  
  // Available languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'dockerfile', label: 'Dockerfile' },
  ];

  // Initialize room
  useEffect(() => {
    if (!socket || !isConnected) return;

    const joinRoom = () => {
      const username = user?.username || `Guest-${Math.random().toString(36).substr(2, 6)}`;
      const userId = user?.id || `guest-${Date.now()}`;
      
      socket.emit('join-room', {
        roomId: roomId || undefined,
        username,
        userId,
      });
    };

    joinRoom();

    // Socket event listeners
    socket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      setRoomName(data.roomId);
      setCode(data.code);
      setLanguage(data.language);
      setIsLoading(false);
      
      enqueueSnackbar(`Joined room: ${data.roomId}`, { variant: 'success' });
    });

    socket.on('user-joined', (data) => {
      enqueueSnackbar(`${data.username} joined the room`, { variant: 'info' });
    });

    socket.on('user-left', (data) => {
      enqueueSnackbar(`${data.username} left the room`, { variant: 'warning' });
    });

    socket.on('code-update', (data) => {
      // Apply remote changes to editor
      // In a real implementation, you'd use Operational Transformation
      // For now, we'll just update the code
      if (data.changes) {
        // Apply changes
        // This is simplified - real implementation would be more complex
        setCode(data.changes.text);
      }
    });

    socket.on('language-changed', (data) => {
      setLanguage(data.language);
      enqueueSnackbar(`Language changed to ${data.language}`, { variant: 'info' });
    });

    socket.on('chat-message', (data) => {
      // Handle incoming chat messages
      // This would update the messages context
    });

    socket.on('ai-response', (data) => {
      // Handle AI responses
      // This would update the aiResponses context
    });

    return () => {
      socket.off('room-joined');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-changed');
      socket.off('chat-message');
      socket.off('ai-response');
      
      if (roomId) {
        socket.emit('leave-room', { roomId });
      }
    };
  }, [socket, isConnected, roomId, user, enqueueSnackbar]);

  // Handle editor changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    
    setCode(value);
    
    // Send changes to server
    if (socket && roomId) {
      socket.emit('code-change', {
        room: roomId,
        changes: {
          type: 'replace',
          text: value,
          position: 0,
          length: code.length
        },
        version: Date.now(),
        cursor: cursorPosition
      });
    }
  }, [socket, roomId, code, cursorPosition, setCode]);

  // Handle cursor position changes
  const handleCursorChange = useCallback((position: editor.IPosition) => {
    setCursorPosition(position);
    
    // Send cursor position to server
    if (socket && roomId) {
      socket.emit('cursor-move', {
        room: roomId,
        cursor: position
      });
    }
  }, [socket, roomId, setCursorPosition]);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    
    if (socket && roomId) {
      socket.emit('change-language', {
        room: roomId,
        language: newLanguage
      });
    }
  };

  // Handle chat message send
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !socket || !roomId) return;
    
    socket.emit('chat-message', {
      room: roomId,
      message: chatMessage
    });
    
    setChatMessage('');
  };

  // Handle AI assistance request
  const handleAIRequest = () => {
    if (!aiPrompt.trim() || !socket || !roomId) return;
    
    socket.emit('ai-assist', {
      room: roomId,
      prompt: aiPrompt,
      context: code,
      shareWithRoom: true
    });
    
    setAiPrompt('');
  };

  // Handle code execution
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');
    
    try {
      // In a real implementation, you would send code to a backend execution service
      // For now, we'll simulate execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simulatedOutput = `$ node ${language || 'javascript'}\n> ${code.substring(0, 50)}...\n\n✅ Execution completed successfully!\n\nOutput:\nHello, World!\n\nExecution time: 0.123s\nMemory used: 12.5 MB`;
      
      setOutput(simulatedOutput);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((event) => {
      handleCursorChange(event.position);
    });
  };

  // Copy room link
  const handleCopyRoomLink = () => {
    const roomLink = `${window.location.origin}/editor/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    enqueueSnackbar('Room link copied to clipboard!', { variant: 'success' });
  };

  // Share room
  const handleShareRoom = () => {
    if (navigator.share) {
      navigator.share({
        title: `CodeCollab: ${roomName}`,
        text: `Join me in coding on CodeCollab!`,
        url: `${window.location.origin}/editor/${roomId}`,
      });
    } else {
      handleCopyRoomLink();
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leave-room', { roomId });
    }
    navigate('/');
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Scroll AI to bottom
  useEffect(() => {
    if (aiContainerRef.current) {
      aiContainerRef.current.scrollTop = aiContainerRef.current.scrollHeight;
    }
  }, [aiResponses]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Container maxWidth={false}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CodeIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" noWrap>
                  {roomName}
                </Typography>
                <Chip
                  label={isConnected ? 'Connected' : 'Disconnected'}
                  size="small"
                  color={isConnected ? 'success' : 'error'}
                  icon={isConnected ? <CheckIcon /> : <ErrorIcon />}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Tooltip title="Run Code">
                  <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={handleRunCode}
                    disabled={isRunning}
                    size="small"
                  >
                    {isRunning ? 'Running...' : 'Run'}
                  </Button>
                </Tooltip>
                
                <Tooltip title="Copy Room Link">
                  <IconButton onClick={handleCopyRoomLink}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share Room">
                  <IconButton onClick={handleShareRoom}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                
                <IconButton
                  onClick={(e) => setSettingsAnchor(e.currentTarget)}
                >
                  <MoreIcon />
                </IconButton>
                
                <Menu
                  anchorEl={settingsAnchor}
                  open={Boolean(settingsAnchor)}
                  onClose={() => setSettingsAnchor(null)}
                >
                  <MenuItem onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}>
                    <ListItemIcon>
                      {editorTheme === 'vs-dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </ListItemIcon>
                    <ListItemText>
                      {editorTheme === 'vs-dark' ? 'Light Theme' : 'Dark Theme'}
                    </ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLeaveRoom}>
                    <ListItemIcon>
                      <ExitIcon />
                    </ListItemIcon>
                    <ListItemText>Leave Room</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                <AvatarGroup max={4}>
                  {users.map((user) => (
                    <Tooltip key={user.id} title={user.username}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: user.color,
                          border: '2px solid',
                          borderColor: 'background.paper',
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
                
                <Tooltip title="Active Users">
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${users.length} online`}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ py: 3, height: 'calc(100vh - 80px)' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Editor Column */}
          <Grid item xs={12} md={isChatOpen ? 8 : 12} lg={isChatOpen ? 6 : 10}>
            <Paper
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Editor Toolbar */}
              <Box
                sx={{
                  p: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <TextField
                  select
                  size="small"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ minWidth: 150 }}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </TextField>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <Tooltip title="Toggle AI Assistant">
                  <IconButton
                    onClick={() => setIsAIOpen(!isAIOpen)}
                    color={isAIOpen ? 'primary' : 'default'}
                  >
                    <AIIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Toggle Chat">
                  <IconButton
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    color={isChatOpen ? 'primary' : 'default'}
                  >
                    <Badge badgeContent={messages.length} color="primary">
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Code Editor */}
              <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  theme={editorTheme}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'all',
                    formatOnPaste: true,
                    formatOnType: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',
                    tabSize: 2,
                  }}
                />
                
                {/* User Cursors */}
                <AnimatePresence>
                  {users.map((user) => (
                    user.cursor && (
                      <UserCursor
                        key={user.id}
                        user={user}
                        position={user.cursor}
                      />
                    )
                  ))}
                </AnimatePresence>
              </Box>

              {/* Output Panel */}
              {output && (
                <Box
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Output
                    </Typography>
                    <Typography
                      component="pre"
                      sx={{
                        m: 0,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {output}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Chat & AI Sidebar */}
          <AnimatePresence>
            {isChatOpen && (
              <Grid item xs={12} md={4} lg={3}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ height: '100%' }}
                >
                  <Paper
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Chat Header */}
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <ChatIcon />
                      <Typography variant="h6">Chat</Typography>
                      <Chip
                        label={messages.length}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>

                    {/* Chat Messages */}
                    <Box
                      ref={chatContainerRef}
                      sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        p: 2,
                      }}
                    >
                      {messages.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                          sx={{ py: 4 }}
                        >
                          No messages yet. Start the conversation!
                        </Typography>
                      ) : (
                        messages.map((message) => (
                          <ChatMessage
                            key={message.id}
                            message={message}
                          />
                        ))
                      )}
                    </Box>

                    {/* Chat Input */}
                    <Box
                      sx={{
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Type a message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleSendMessage}
                                disabled={!chatMessage.trim()}
                                size="small"
                              >
                                <SendIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        multiline
                        maxRows={3}
                      />
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            )}
          </AnimatePresence>

          {/* AI Assistant Sidebar */}
          <AnimatePresence>
            {isAIOpen && (
              <Grid item xs={12} lg={3}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ height: '100%' }}
                >
                  <AIAssistant
                    prompt={aiPrompt}
                    setPrompt={setAiPrompt}
                    onRequest={handleAIRequest}
                    responses={aiResponses}
                  />
                </motion.div>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </Container>
    </Box>
  );
};

export default EditorPage;