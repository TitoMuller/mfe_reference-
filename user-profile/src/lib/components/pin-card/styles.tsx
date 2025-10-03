import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  root: {
    backgroundColor: (theme.palette.brand.gray as Record<string, string>)['900-20%'],
    padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    border: theme.palette.border.secondary,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breadcrumb: {
    display: 'flex',
    color: theme.palette.tx.primary,
    alignItems: 'flex-end',
    textAlign: 'center',
    fontSize: 14,
    a: {
      fontSize: 14,
    },
  },
  pillTag: {
    fontSize: '14px',
    borderRadius: '4px',
    padding: '0.125rem 0.5rem',
    backgroundColor: theme.palette.brand.purple['900'],
    maxWidth: 200,
    lineHeight: 1.4,
    maxHeight: '1.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    a: {
      color: theme.palette.tx.primary,
      fontSize: 12,
    },
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: theme.palette.tx.tertiary.hover,
    span: { color: theme.palette.tx.tertiary.default },

    '@supports (display: -webkit-box)': {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      whiteSpace: 'normal',
    },
  },
  footer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: 'auto',
    color: theme.palette.tx.secondary.default,
  },
  cloud: {
    display: 'flex',
    gap: theme.spacing(0.4),
    alignItems: 'center',
    color: theme.palette.tx.secondary.default,
  },
  counter: {
    display: 'flex',
    gap: theme.spacing(0.4),
    alignItems: 'center',
    color: theme.palette.white,
  },
  counterIcon: {
    fontSize: '20px',
    width: '1.25rem',
    height: '1.25rem',
  },
}));
