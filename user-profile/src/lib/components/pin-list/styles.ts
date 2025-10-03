import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  list: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
}));
