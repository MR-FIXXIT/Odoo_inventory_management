import { useState, useEffect } from 'react';
import API from '../../api/axiosInstance';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

const StockMovesPage = () => {
  const [moves, setMoves] = useState([]);
  const [search, setSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      try {
        const url = search ? `/api/inventory/moves/?search=${search}` : '/api/inventory/moves/';
        const res = await API.get(url);
        setMoves(res.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch move history', { variant: 'error' });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, enqueueSnackbar]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Stock Move Ledger</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Immutable ledger of all inventory transactions.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by product SKU, name, or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>From → To</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Operation</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No ledger entries found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              moves.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{format(new Date(row.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.product_sku} - {row.product_name}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.source_location_name || 'Vendor / Cust.'} sx={{ mr: 1, mb: 1 }} />
                    →
                    <Chip size="small" label={row.destination_location_name || 'Vendor / Cust.'} sx={{ ml: 1, mb: 1 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {parseFloat(row.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {row.operation_reference ? (
                      <Chip label={row.operation_reference} color="primary" variant="outlined" size="small" />
                    ) : '-'}
                  </TableCell>
                  <TableCell>{row.notes || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StockMovesPage;
