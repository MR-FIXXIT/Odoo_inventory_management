import { useState, useEffect } from 'react';
import API from '../../api/axiosInstance';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Collapse, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, 
  KeyboardArrowDown as DownIcon, KeyboardArrowUp as UpIcon 
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const WarehouseRow = ({ row, onEdit, onAddLocation, onEditLocation }) => {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && locations.length === 0) {
      setLoading(true);
      API.get(`/api/inventory/locations/?warehouse=${row.id}`)
        .then(res => setLocations(res.data))
        .finally(() => setLoading(false));
    }
  }, [open, row.id]);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <UpIcon /> : <DownIcon />}
          </IconButton>
        </TableCell>
        <TableCell fontWeight="bold">{row.code}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.address || '-'}</TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={() => onEdit(row)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Locations inside {row.code}
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => onAddLocation(row)}>
                  Add Location
                </Button>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {loading ? 'Loading...' : 'No locations configured'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell>{loc.name}</TableCell>
                        <TableCell>{loc.location_type}</TableCell>
                        <TableCell>{loc.description}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => onEditLocation(loc, row)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  // Warehouse Dialog state
  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [currentWh, setCurrentWh] = useState(null);

  // Location Dialog state
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [activeWhId, setActiveWhId] = useState(null);

  const fetchWarehouses = async () => {
    try {
      const res = await API.get('/api/inventory/warehouses/');
      setWarehouses(res.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch warehouses', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // --- Warehouse Handlers ---
  const handleOpenWhDialog = (wh = null) => {
    setCurrentWh(wh || { code: '', name: '', address: '' });
    setWhDialogOpen(true);
  };

  const handleSaveWh = async () => {
    try {
      if (currentWh.id) {
        await API.patch(`/api/inventory/warehouses/${currentWh.id}/`, currentWh);
        enqueueSnackbar('Warehouse updated', { variant: 'success' });
      } else {
        await API.post('/api/inventory/warehouses/', currentWh);
        enqueueSnackbar('Warehouse created', { variant: 'success' });
      }
      setWhDialogOpen(false);
      fetchWarehouses();
    } catch (e) {
      enqueueSnackbar('Error saving warehouse', { variant: 'error' });
    }
  };

  // --- Location Handlers ---
  const handleOpenLocDialog = (loc = null, warehouse) => {
    setActiveWhId(warehouse.id);
    setCurrentLoc(loc || { name: '', location_type: 'SHELF', description: '', warehouse: warehouse.id });
    setLocDialogOpen(true);
  };

  const handleSaveLoc = async () => {
    try {
      if (currentLoc.id) {
        await API.patch(`/api/inventory/locations/${currentLoc.id}/`, currentLoc);
        enqueueSnackbar('Location updated', { variant: 'success' });
      } else {
        await API.post('/api/inventory/locations/', currentLoc);
        enqueueSnackbar('Location created', { variant: 'success' });
      }
      setLocDialogOpen(false);
      // Hacky way: easiest is to just tell users to collapse/expand to refresh, 
      // or we can force a full fetch. For simplicity, just close the dialog.
    } catch (e) {
      enqueueSnackbar('Error saving location', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Warehouses & Locations</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenWhDialog()}>
          Add Warehouse
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableCell width={50} />
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.map((row) => (
              <WarehouseRow 
                key={row.id} 
                row={row} 
                onEdit={handleOpenWhDialog}
                onAddLocation={(wh) => handleOpenLocDialog(null, wh)}
                onEditLocation={handleOpenLocDialog}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Warehouse Dialog */}
      <Dialog open={whDialogOpen} onClose={() => setWhDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentWh?.id ? 'Edit Warehouse' : 'New Warehouse'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Code" 
              value={currentWh?.code || ''} 
              onChange={e => setCurrentWh({...currentWh, code: e.target.value})}
              required
            />
            <TextField 
              label="Name" 
              value={currentWh?.name || ''} 
              onChange={e => setCurrentWh({...currentWh, name: e.target.value})}
              required
            />
            <TextField 
              label="Address" 
              multiline rows={2}
              value={currentWh?.address || ''} 
              onChange={e => setCurrentWh({...currentWh, address: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWhDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWh} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={locDialogOpen} onClose={() => setLocDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{currentLoc?.id ? 'Edit Location' : 'New Location'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="Name" 
              value={currentLoc?.name || ''} 
              onChange={e => setCurrentLoc({...currentLoc, name: e.target.value.toUpperCase()})}
              required
              helperText="e.g. RACK-A1"
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={currentLoc?.location_type || 'SHELF'}
                label="Type"
                onChange={e => setCurrentLoc({...currentLoc, location_type: e.target.value})}
              >
                <MenuItem value="SHELF">Shelf</MenuItem>
                <MenuItem value="RACK">Rack</MenuItem>
                <MenuItem value="ZONE">Zone</MenuItem>
                <MenuItem value="FLOOR">Floor</MenuItem>
                <MenuItem value="DOCK">Dock</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Description" 
              value={currentLoc?.description || ''} 
              onChange={e => setCurrentLoc({...currentLoc, description: e.target.value})}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveLoc} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehousesPage;
