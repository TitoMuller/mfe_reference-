import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  root: {
    fontFamily: 'inter',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    maxHeight: '90vh',
  },
  container: {
    // width: '100%',
    maxWidth: 580,
    width: 500,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  paper: {
    position: 'relative',
    border: theme.palette.border.secondary,
    minHeight: 200,
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    width: '600px',
    maxWidth: '90vw',
    margin: 'auto',
    maxHeight: 'none',
    overflowY: 'visible',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },
  title: {
    position: 'relative',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  description: {
    color: 'text.secondary',
    marginBottom: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  closeButton: {
    padding: theme.spacing(0.5),
  },
  content: {
    marginTop: theme.spacing(2),
  },
  error: {
    marginBottom: theme.spacing(2),
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 580,
    margin: theme.spacing(2),
  },
}));
