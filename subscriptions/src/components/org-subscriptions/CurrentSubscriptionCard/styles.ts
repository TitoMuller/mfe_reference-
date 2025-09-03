import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  paper: {
    border: theme.palette.border.secondary,
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.lg,
  },
  tierText: {
    position: 'relative',
    textTransform: 'capitalize',
    fontWeight: 600,
  },

  priceBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    flexShrink: 0,
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  priceText: {
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: 'clamp(1.5rem, 4vw, 2.125rem)',
  },
  periodText: {
    color: 'text.secondary',
  },
  usageBox: {
    // border: '1px solid red',
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  renewalText: {
    color: 'text.secondary',
    position: 'absolute',
    top: -10,
    right: -10,
  },
}));
