import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#714B67', // Odoo Purple
      light: '#8d6380',
      dark: '#51344a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#017E84', // Odoo Teal
      light: '#019b9e',
      dark: '#005b63',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8F9FA', // Main workspace background
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    sidebar: {
      main: '#212529', // Dark slate for sidebar
    }
  },
  typography: {
    fontFamily: '"Inter", "Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Odoo doesn't use all-caps buttons
      fontWeight: 500,
    },
    h4: {
      fontWeight: 600,
      color: '#212529',
    },
    h5: {
      fontWeight: 600,
      color: '#212529',
    },
    h6: {
      fontWeight: 600,
      color: '#212529',
    }
  },
  shape: {
    borderRadius: 8, // rounded-sm feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Odoo style rounded-sm
          padding: '6px 16px',
        },
        containedPrimary: {
          backgroundColor: '#714B67',
          '&:hover': {
            backgroundColor: '#51344a',
          },
        },
        containedSecondary: {
          backgroundColor: '#017E84',
          '&:hover': {
            backgroundColor: '#005b63',
          },
        },
        outlined: {
          borderColor: '#dee2e6', // light gray border
          color: '#495057',
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#f8f9fa',
            borderColor: '#adb5bd',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #dee2e6',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8f9fa',
          color: '#495057',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#ffffff',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#f8f9fa', // Odoo-style striped rows
          },
          '&:hover': {
            backgroundColor: '#f1f3f5 !important', // Subtle hover effect
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: 8,
        }
      }
    }
  },
});

export default theme;
