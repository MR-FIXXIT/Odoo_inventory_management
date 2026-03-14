import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Link, Stepper, Step, StepLabel,
} from '@mui/material';
import FactoryIcon from '@mui/icons-material/Factory';

const steps = ['Enter Email', 'Verify OTP & Reset'];

export default function ForgotPasswordPage() {
  const { requestOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [reNewPassword, setReNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestOtp(email);
      setSuccess('If a matching account was found, an OTP has been sent to your email.');
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== reNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password: newPassword, re_new_password: reNewPassword });
      navigate('/login', { state: { message: 'Password reset successful! Please sign in with your new password.' } });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Password reset failed.');
      } else {
        setError('Password reset failed. Please try again.');
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
        maxWidth: 460,
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
              sx={{ height: 60, mb: 1, objectFit: 'contain' }}
            />
            <Typography variant="h5" fontWeight={600} sx={{ color: '#212529', letterSpacing: 0.5 }}>
              Reset Password
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && activeStep === 1 && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          {activeStep === 0 ? (
            <form onSubmit={handleRequestOtp}>
              <TextField fullWidth label="Email Address" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 3 }} autoFocus />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5 }}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <TextField fullWidth label="OTP Code" value={otp} onChange={(e) => setOtp(e.target.value)}
                required sx={{ mb: 2 }} inputProps={{ maxLength: 6 }} placeholder="6-digit code" autoFocus />
              <TextField fullWidth label="New Password" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth label="Confirm New Password" type="password" value={reNewPassword}
                onChange={(e) => setReNewPassword(e.target.value)} required sx={{ mb: 3 }} />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Back to{' '}
            <Link component={RouterLink} to="/login" sx={{ color: '#714B67', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
