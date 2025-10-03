import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  title: {
    //todo: check values Sveta !!!!!!!!
    fontSize: '12px',
    // lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 600,
  },
  line: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.tx.secondary.default,
  },
}));
