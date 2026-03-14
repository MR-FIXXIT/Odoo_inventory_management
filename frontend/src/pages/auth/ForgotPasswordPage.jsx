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
      bgcolor: '#0A0E1A',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(108, 99, 255, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(0, 217, 166, 0.06) 0%, transparent 50%), #0A0E1A',
    }}>
      <Card sx={{
        width: '100%', maxWidth: 460, mx: 2,
        bgcolor: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(108, 99, 255, 0.15)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FactoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #6C63FF, #00D9A6)',
              backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
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
            <Link component={RouterLink} to="/login" color="primary.light">Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
