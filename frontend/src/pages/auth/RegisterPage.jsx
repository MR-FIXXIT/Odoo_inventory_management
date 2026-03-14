import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Link, MenuItem,
  InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InventoryIcon from '@mui/icons-material/Inventory';

const ROLES = [
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'warehouse_staff', label: 'Warehouse Staff' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ loginid: '', email: '', password: '', password2: '', role: 'warehouse_staff' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        const fieldErrors = {};
        let generalError = '';
        Object.entries(data).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          if (['loginid', 'email', 'password', 'password2', 'role'].includes(key)) {
            fieldErrors[key] = msg;
          } else {
            generalError += msg + ' ';
          }
        });
        setErrors(fieldErrors);
        if (generalError) setError(generalError.trim());
      } else {
        setError('Registration failed. Please try again.');
      }
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
        maxWidth: 420,
        mx: 2,
        bgcolor: '#ffffff',
        border: '1px solid #dee2e6',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        borderRadius: 2
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box 
              component="img"
              src="/fabriq ERP.png"
              alt="Fabriq ERP Logo"
              sx={{ height: 50, mb: 1, objectFit: 'contain' }}
            />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#212529', letterSpacing: 0.5 }}>
              Create Account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 1, p: 1, '& .MuiAlert-message': { p: 0.5 } }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth label="Login ID" name="loginid" variant="outlined" size="small"
              value={form.loginid} onChange={handleChange}
              required error={!!errors.loginid} helperText={errors.loginid} sx={{ mb: 2 }} autoFocus 
            />
            <TextField 
              fullWidth label="Email" name="email" type="email" variant="outlined" size="small"
              value={form.email} onChange={handleChange}
              required error={!!errors.email} helperText={errors.email} sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth label="Password" name="password" variant="outlined" size="small"
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={handleChange} required error={!!errors.password}
              helperText={errors.password} sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField 
              fullWidth label="Confirm Password" name="password2" variant="outlined" size="small"
              type={showPassword ? 'text' : 'password'}
              value={form.password2} onChange={handleChange} required error={!!errors.password2}
              helperText={errors.password2} sx={{ mb: 2 }} 
            />
            <TextField 
              fullWidth select label="Role" name="role" variant="outlined" size="small"
              value={form.role} onChange={handleChange}
              error={!!errors.role} helperText={errors.role} sx={{ mb: 4 }}
            >
              {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            <Button 
               type="submit" variant="contained" disableElevation fullWidth disabled={loading} 
               sx={{ py: 1.2, fontWeight: 600 }}
            >
              {loading ? 'Processing...' : 'Register'}
            </Button>
          </form>

          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
