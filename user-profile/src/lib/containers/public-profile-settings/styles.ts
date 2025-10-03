import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  dangerZoneContent: {
    '& p': {
      margin: 0,
    },

    '& .orgLink': {
      color: theme.palette.tx.primary,
    },

    '& .hint': {
      fontSize: 14,
      color: theme.palette.tx.placeholder.default,
    },
  },
}));
