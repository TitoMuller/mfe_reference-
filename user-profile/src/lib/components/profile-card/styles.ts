import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  avatar: {
    fontSize: '3rem',
    marginInline: 'auto',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  faded: {
    color: theme.palette.tx.primary,
    fontSize: '14px',
    letterSpacing: '0.15px',
    lineHeight: '19.6px',
  },
  edit: {
    color: theme.palette.tx.secondary.default,
    textDecorationLine: 'underline',
    textDecorationThickness: '0.2px',
    textUnderlineOffset: '4px',
    fontWeight: 600,
    transitionProperty: 'all',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      color: theme.palette.tx.secondary.hover,
    },
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
}));
