import { styled } from '@mui/material';
export const StyledToggle = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '56px',
  height: '28px',
  borderRadius: '34px',
  backgroundColor: '#e0e0e0',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  '&.active': {
    backgroundColor: theme.palette.brand.purple[500],
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    height: '22px',
    width: '22px',
    left: '3px',
    bottom: '3px',
    borderRadius: '50%',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s',
  },
  '&.active::after': {
    transform: 'translateX(28px)',
  },
}));
