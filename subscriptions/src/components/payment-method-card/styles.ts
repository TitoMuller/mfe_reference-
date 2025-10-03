import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  container: {
    border: theme.palette.border.secondary,
    padding: theme.spacing(2),
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'black',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  detailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
  },
  cardNumber: {
    fontWeight: 500,
  },
  expiryText: {
    color: 'text.secondary',
  },
  defaultBadge: {
    // display: 'flex',
    backgroundColor: theme.palette.brand.primary[500],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing(0.5),
  },
  actionsWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  actionLink: {
    cursor: 'pointer',
    color: theme.palette.brand.primary[500],
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  actionLinkDelete: {
    cursor: 'pointer',
    color: theme.palette.brand.orange[500],
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  paper: {
    borderColor: theme.palette.tx.disabled,
    borderWidth: 1,
    borderStyle: 'solid',
    minHeight: 200,
    padding: theme.spacing(3),
    borderRadius: theme.borderRadius.lg,
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    position: 'relative',
    fontWeight: 600,
  },
  subtitle: {
    color: 'text.secondary',
    marginBottom: theme.spacing(2),
  },
  paymentInfoContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
  addPaymentContainer: {
    // border: '1px solid red',
    display: 'flex',
    flexGrow: 1,
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(2),
    // marginTop: theme.spacing(4),
  },
  root: {
    width: '100%',
  },
}));
