import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()(() => ({
  plans: {
    display: 'flex',
    gap: '32px',
  },
  planCard: {
    width: '100%',
    maxWidth: '334px',
  },
}));
