import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Link, InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginid, setLoginid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginid, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#F8F9FA', // Odoo light background
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 400,
        mx: 2,
        bgcolor: '#ffffff',
        border: '1px solid #dee2e6',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRadius: 2
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box 
              component="img"
              src="/fabriq ERP.png"
              alt="Fabriq ERP Logo"
              sx={{ height: 60, mb: 1, objectFit: 'contain' }}
            />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#212529', letterSpacing: 0.5 }}>
              CoreInventory
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Inventory Management System
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1, p: 1, '& .MuiAlert-message': { p: 0.5 } }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Login ID"
              variant="outlined"
              size="small"
              value={loginid}
              onChange={(e) => setLoginid(e.target.value)}
              required
              sx={{ mb: 3 }}
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              size="small"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disableElevation
              fullWidth
              disabled={loading}
              sx={{ py: 1.2, fontWeight: 600 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                Register
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
