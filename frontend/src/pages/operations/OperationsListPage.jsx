import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, IconButton,
  Chip, Tabs, Tab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const statusColors = {
  DRAFT: 'default',
  WAITING: 'warning',
  READY: 'info',
  DONE: 'success',
  CANCELLED: 'error'
};

const OperationsListPage = ({ opType, title }) => {
  const [operations, setOperations] = useState([]);
  const [statusTab, setStatusTab] = useState('ALL');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const opPath = {
    RECEIPT: 'receipts',
    DELIVERY: 'deliveries',
    INTERNAL: 'transfers',
    ADJUSTMENT: 'adjustments'
  }[opType] || `${opType.toLowerCase()}s`;

  const fetchOperations = useCallback(async () => {
    try {
      let url = `/api/inventory/operations/?op_type=${opType}`;
      if (statusTab !== 'ALL') {
        url += `&status=${statusTab}`;
      }
      const res = await API.get(url);
      setOperations(res.data);
    } catch (error) {
      enqueueSnackbar(`Failed to fetch ${title.toLowerCase()}`, { variant: 'error' });
    }
  }, [opType, statusTab, enqueueSnackbar, title]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">{title}</Typography>
        <Box>
          <IconButton onClick={fetchOperations} sx={{ mr: 1 }}><RefreshIcon /></IconButton>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate(`/operations/${opPath}/new`)}
          >
            New {title.replace(/s$/, '')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusTab}
          onChange={(e, v) => setStatusTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="ALL" />
          <Tab label="Draft" value="DRAFT" />
          <Tab label="Waiting" value="WAITING" />
          <Tab label="Ready" value="READY" />
          <Tab label="Done" value="DONE" />
          <Tab label="Cancelled" value="CANCELLED" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell>Reference</TableCell>
              {['RECEIPT', 'DELIVERY'].includes(opType) && (
                <TableCell>{opType === 'RECEIPT' ? 'Supplier' : 'Customer'}</TableCell>
              )}
              <TableCell>From / To</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              operations.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.reference}</TableCell>
                  
                  {['RECEIPT', 'DELIVERY'].includes(opType) && (
                    <TableCell>{row.partner_name || '-'}</TableCell>
                  )}
                  
                  <TableCell>
                    {opType === 'RECEIPT' ? `Vendor → ${row.destination_location_name}` :
                     opType === 'DELIVERY' ? `${row.source_location_name} → Customer` :
                     opType === 'ADJUSTMENT' ? `Location: ${row.source_location_name || row.destination_location_name}` :
                     `${row.source_location_name} → ${row.destination_location_name}`
                    }
                  </TableCell>
                  
                  <TableCell>{row.scheduled_date ? format(new Date(row.scheduled_date), 'MMM dd, yyyy') : '-'}</TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={statusColors[row.status] || 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/operations/${opPath}/${row.id}`)} 
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OperationsListPage;
