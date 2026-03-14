import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axiosInstance';
import {
  Box, Typography, Paper, TextField, Button, Grid,
  MenuItem, Divider, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Step, Stepper, StepLabel
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const STEPS = ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED'];

const OperationFormPage = ({ opType, title }) => {
  const { id } = useParams();
  const isEdit = id !== 'new' && id !== undefined;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const opPath = {
    RECEIPT: 'receipts',
    DELIVERY: 'deliveries',
    INTERNAL: 'transfers',
    ADJUSTMENT: 'adjustments'
  }[opType] || `${opType.toLowerCase()}s`;

  const [loading, setLoading] = useState(isEdit);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    op_type: opType,
    partner_name: '',
    source_location: '',
    destination_location: '',
    scheduled_date: '',
    notes: '',
    lines: []
  });

  const [status, setStatus] = useState('DRAFT');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [locRes, prodRes] = await Promise.all([
          API.get('/api/inventory/locations/'),
          API.get('/api/inventory/products/')
        ]);
        setLocations(locRes.data);
        setProducts(prodRes.data);
      } catch (e) {
        enqueueSnackbar('Failed to load selection data', { variant: 'error' });
      }
    };
    fetchSelectData();
  }, [enqueueSnackbar]);

  const loadOperation = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/inventory/operations/${id}/`);
      setFormData({
        op_type: res.data.op_type,
        partner_name: res.data.partner_name || '',
        source_location: res.data.source_location || '',
        destination_location: res.data.destination_location || '',
        scheduled_date: res.data.scheduled_date || '',
        notes: res.data.notes || '',
        lines: res.data.lines || []
      });
      setStatus(res.data.status);
      setReference(res.data.reference);
    } catch (e) {
      enqueueSnackbar('Failed to load operation', { variant: 'error' });
      navigate(`/operations/${opPath}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadOperation();
    }
  }, [id, isEdit]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (status === 'DONE' || status === 'CANCELLED') return;

    try {
      const payload = { ...formData };
      if (!payload.source_location) delete payload.source_location;
      if (!payload.destination_location) delete payload.destination_location;

      if (isEdit) {
        await API.patch(`/api/inventory/operations/${id}/`, payload);
        enqueueSnackbar('Saved', { variant: 'success' });
        loadOperation();
      } else {
        const res = await API.post('/api/inventory/operations/', payload);
        enqueueSnackbar('Created', { variant: 'success' });
        navigate(`/operations/${opPath}/${res.data.id}`);
      }
    } catch (e) {
      enqueueSnackbar('Failed to save', { variant: 'error' });
    }
  };

  const handleAction = async (actionPath) => {
    try {
      if (status !== 'DRAFT') await handleSave();
      await API.post(`/api/inventory/operations/${id}/${actionPath}/`);
      
      // Check for low stock alerts if opType is delivery or transfer
      if (actionPath === 'validate') {
        enqueueSnackbar('Validation successful!', { variant: 'success' });
        // Simulating Odoo toaster notifications for low stock warning
        formData.lines.forEach(line => {
          const product = products.find(p => p.id === line.product);
          if (product && product.is_low_stock) {
            enqueueSnackbar(`Low Stock Alert: ${product.name} needs reordering.`, { variant: 'warning' });
          }
        });
      } else {
        enqueueSnackbar('State updated', { variant: 'success' });
      }
      
      loadOperation();
    } catch (e) {
      enqueueSnackbar(e.response?.data?.error || `Failed to ${actionPath}`, { variant: 'error' });
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { product: '', demanded_qty: '1.00', done_qty: '0.00', id: Date.now() }]
    });
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const removeLine = (index) => {
    const newLines = [...formData.lines];
    newLines.splice(index, 1);
    setFormData({ ...formData, lines: newLines });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const isEditable = status !== 'DONE' && status !== 'CANCELLED';
  
  // Custom Status Tracker styling for Odoo feel
  const activeStep = STEPS.indexOf(status);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {title} / {isEdit ? reference : 'New'}
        </Typography>
      </Box>

      <Paper sx={{ border: '1px solid #dee2e6', overflow: 'hidden', mb: 4 }}>
        
        {/* Odoo Style Status Tracker Header */}
        <Box sx={{ bgcolor: '#ffffff', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6' }}>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isEdit && ['DRAFT', 'WAITING', 'READY'].includes(status) && (
              <Button 
                variant="contained" 
                color="secondary" // Maps to our Odoo Teal "#017E84"
                onClick={() => handleAction('validate')}
              >
                Validate
              </Button>
            )}
            {isEdit && status === 'DRAFT' && (
              <Button variant="contained" onClick={() => handleAction('mark_ready')}>
                Mark as Ready
              </Button>
            )}
            {isEditable && (
             <Button variant="outlined" onClick={handleSave} sx={{ bgcolor: '#fff' }}>
               Save
             </Button>
            )}
            {isEdit && isEditable && (
              <Button variant="outlined" sx={{ color: '#495057' }} onClick={() => handleAction('cancel')}>
                Cancel
              </Button>
            )}
          </Box>

          {isEdit && status !== 'CANCELLED' && (
            <Stepper activeStep={activeStep} sx={{ width: '50%' }}>
              {STEPS.slice(0, 4).map((label) => (
                <Step key={label}>
                  <StepLabel StepIconProps={{
                    sx: { color: activeStep >= STEPS.indexOf(label) ? '#017E84' : '#dee2e6' }
                  }}>
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {isEdit && status === 'CANCELLED' && (
             <Typography sx={{ color: 'error.main', fontWeight: 'bold', mr: 2 }}>CANCELLED</Typography>
          )}

        </Box>
        
        {/* Form Content */}
        <Box component="form" sx={{ p: 4, bgcolor: '#ffffff' }}>
          
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {['RECEIPT', 'DELIVERY'].includes(opType) && (
                  <TextField
                    fullWidth
                    label={opType === 'RECEIPT' ? 'Vendor / Supplier' : 'Customer'}
                    value={formData.partner_name}
                    onChange={e => setFormData({ ...formData, partner_name: e.target.value })}
                    disabled={!isEditable}
                    size="small"
                  />
                )}
                
                <TextField
                  fullWidth
                  type="date"
                  label="Scheduled Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.scheduled_date}
                  onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })}
                  disabled={!isEditable}
                  size="small"
                />

                {/* Source Location - Shown normally unless it's a transfer */}
                {opType !== 'RECEIPT' && opType !== 'INTERNAL' && (
                  <TextField
                    select
                    fullWidth
                    label={opType === 'ADJUSTMENT' ? 'Location' : 'Source Location'}
                    value={formData.source_location}
                    onChange={e => setFormData({ 
                      ...formData, 
                      source_location: e.target.value,
                      destination_location: opType === 'ADJUSTMENT' ? e.target.value : formData.destination_location
                    })}
                    disabled={!isEditable}
                    required={opType === 'DELIVERY' || opType === 'ADJUSTMENT'}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="" disabled><em>Select Location...</em></MenuItem>
                    {locations.map(loc => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.warehouse_name} / {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Destination Location - Shown normally unless it's a transfer or adjustment */}
                {opType !== 'DELIVERY' && opType !== 'INTERNAL' && opType !== 'ADJUSTMENT' && (
                  <TextField
                    select
                    fullWidth
                    label="Destination Location"
                    value={formData.destination_location}
                    onChange={e => setFormData({ ...formData, destination_location: e.target.value })}
                    disabled={!isEditable}
                    required={opType === 'RECEIPT'}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="" disabled><em>Select Location...</em></MenuItem>
                    {locations.map(loc => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.warehouse_name} / {loc.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* Split View specifically for Internal Transfers */}
                {opType === 'INTERNAL' && (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Source Location"
                      value={formData.source_location}
                      onChange={e => setFormData({ ...formData, source_location: e.target.value })}
                      disabled={!isEditable}
                      required
                      size="small"
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="" disabled><em>Select Source...</em></MenuItem>
                      {locations.map(loc => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.warehouse_name} / {loc.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Box sx={{ textAlign: 'center', color: '#adb5bd', my: -1 }}>
                      ▼
                    </Box>
                    <TextField
                      select
                      fullWidth
                      label="Destination Location"
                      value={formData.destination_location}
                      onChange={e => setFormData({ ...formData, destination_location: e.target.value })}
                      disabled={!isEditable}
                      required
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="" disabled><em>Select Destination...</em></MenuItem>
                      {locations.map(loc => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.warehouse_name} / {loc.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>

        </Box>
      </Paper>

      {/* Lines Tab */}
      <Paper sx={{ border: '1px solid #dee2e6', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #dee2e6', px: 3, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} color="#212529">Detailed Operations</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell width="20%">{opType === 'ADJUSTMENT' ? 'Theoretical Qty' : 'Demand'}</TableCell>
                <TableCell width="20%">{opType === 'ADJUSTMENT' ? 'Counted Qty' : 'Done'}</TableCell>
                <TableCell width={80}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.lines.map((line, index) => (
                <TableRow key={line.id} sx={{ '& td': { borderBottom: 'none' } }}>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={line.product || ''}
                      onChange={e => updateLine(index, 'product', e.target.value)}
                      disabled={!isEditable}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                    >
                      {products.map(p => (
                        <MenuItem key={p.id} value={p.id}>[{p.sku}] {p.name}</MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={line.demanded_qty}
                      onChange={e => updateLine(index, 'demanded_qty', e.target.value)}
                      disabled={!isEditable}
                      inputProps={{ step: "any" }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={line.done_qty}
                      onChange={e => updateLine(index, 'done_qty', e.target.value)}
                      disabled={!isEditable}
                      inputProps={{ step: "any" }}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ bgcolor: 'rgba(102, 187, 106, 0.1)', px: 1, borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => removeLine(index)} disabled={!isEditable}>
                      <DeleteIcon sx={{ color: '#adb5bd' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {isEditable && (
                <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
                  <TableCell colSpan={4} sx={{ pt: 1, pb: 3 }}>
                    <Button 
                       onClick={addLine}
                       sx={{ color: '#017E84', fontWeight: 500 }}
                    >
                       Add a line
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OperationFormPage;
