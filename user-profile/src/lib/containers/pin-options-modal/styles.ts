import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: 560,
    backgroundColor: theme.palette.brand.gray[900],
    borderRadius: theme.borderRadius.lg,
    border: theme.palette.border.secondary,
    padding: 40,
    h2: {
      margin: 0,
      fontSize: 32,
      fontWeight: 700,
      textAlign: 'center',
    },
    h3: {
      margin: 0,
      fontSize: 16,
      fontWeight: 400,
      textAlign: 'center',
      color: theme.palette.tx.secondary.alt,
    },
  },
}));
