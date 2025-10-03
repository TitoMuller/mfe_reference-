import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  header: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    // todo: checkValues Sveta!!!!!!!!
    fontSize: '14px',
    // lineHeight: theme.typography.body1.lineHeight,
    fontWeight: 600,
  },
  organizationList: {
    display: 'flex',
    gap: theme.spacing(1),
    width: 'min-content',
  },
  subTitle: {
    display: 'flex',
    color: theme.palette.tx.secondary.default,
    fontSize: 14,
    marginBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  link: {
    color: theme.palette.tx.secondary.default,
    textDecorationLine: 'underline',
    fontSize: 12,
    textDecorationThickness: '0.2px',
    textUnderlineOffset: '4px',
    fontWeight: 500,
    transitionProperty: 'all',
    transitionDuration: '300ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      color: theme.palette.tx.secondary.hover,
    },
  },
}));
