import React from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Code as CodeIcon,
  Group as GroupIcon,
  RocketLaunch as RocketIcon,
  Terminal as TerminalIcon,
  Security as SecurityIcon,
  AutoFixHigh as AIIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Collaboration',
      description: 'Code together in real-time with multiple users. See cursor positions, edits, and chat instantly.',
      color: '#4ECDC4',
    },
    {
      icon: <AIIcon sx={{ fontSize: 40 }} />,
      title: 'AI Pair Programming',
      description: 'Get intelligent code suggestions, bug fixes, and explanations from our AI assistant.',
      color: '#FF6B6B',
    },
    {
      icon: <TerminalIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-language Support',
      description: 'Support for 20+ programming languages with syntax highlighting and auto-completion.',
      color: '#45B7D1',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'End-to-end encryption for private rooms. Control access with passwords and permissions.',
      color: '#96CEB4',
    },
  ];

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML',
    'CSS', 'JSON', 'Markdown', 'SQL', 'YAML', 'Dockerfile'
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Code Together, Build Faster
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: 'text.secondary',
                    fontWeight: 400,
                  }}
                >
                  A real-time collaborative code editor with AI pair programming.
                  Perfect for interviews, teaching, and remote team collaboration.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<RocketIcon />}
                    onClick={() => navigate('/editor')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Start Coding Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CodeIcon />}
                    onClick={() => navigate('/rooms')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Explore Rooms
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    p: 3,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mr: 2,
                      }}
                    >
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF5F57' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#28CA42' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      editor.js • 3 collaborators online
                    </Typography>
                  </Box>
                  <Box sx={{ fontFamily: 'monospace', fontSize: 14 }}>
                    <Typography component="pre" sx={{ m: 0, color: '#4ECDC4' }}>
                      <span style={{ color: '#FF6B6B' }}>function</span>{' '}
                      <span style={{ color: '#FECA57' }}>welcome</span>() {'{'}
                    </Typography>
                    <Typography component="pre" sx={{ m: 0, ml: 2, color: '#FFFFFF' }}>
                      <span style={{ color: '#FF9FF3' }}>console</span>.
                      <span style={{ color: '#54A0FF' }}>log</span>(
                      <span style={{ color: '#FF9FF3' }}>'👋 Welcome to CodeCollab!'</span>);
                    </Typography>
                    <Typography component="pre" sx={{ m: 0, ml: 2, color: '#FFFFFF' }}>
                      <span style={{ color: '#FF9FF3' }}>console</span>.
                      <span style={{ color: '#54A0FF' }}>log</span>(
                      <span style={{ color: '#FF9FF3' }}>'🚀 Start coding with your team...'</span>);
                    </Typography>
                    <Typography component="pre" sx={{ m: 0, color: '#4ECDC4' }}>
                      {'}'}
                    </Typography>
                    <Typography component="pre" sx={{ m: 0, mt: 2, color: '#96CEB4' }}>
                      <span style={{ color: '#FF6B6B' }}>// AI Assistant:</span> I can help you write tests!
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Why Choose CodeCollab?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        bgcolor: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Languages Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 6,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Supported Languages
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {languages.map((lang, index) => (
              <motion.div
                key={lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <Chip
                  label={lang}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h2"
            sx={{
              mb: 3,
              fontWeight: 800,
              background: 'linear-gradient(45deg, #4ECDC4, #45B7D1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Ready to Code Together?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              color: 'text.secondary',
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of developers who use CodeCollab for interviews,
            pair programming, teaching, and remote collaboration.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<RocketIcon />}
            onClick={() => navigate('/editor')}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)',
            }}
          >
            Start Free Collaboration
          </Button>
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              color: 'text.secondary',
            }}
          >
            No account required • Free forever for basic features
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;