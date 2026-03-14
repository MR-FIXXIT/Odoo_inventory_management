import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ message = 'No data found', icon: Icon = InboxIcon }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
      <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
      <Typography variant="h6">{message}</Typography>
    </Box>
  );
}
