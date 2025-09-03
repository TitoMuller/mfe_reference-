import { alpha } from '@mui/material';
import { tokens } from 'app-zephyr-styles/themes';
import { makeStyles } from 'tss-react/mui';

export const useCheckoutStyles = makeStyles()((theme) => ({
  stickyContainer: {
    padding: theme.spacing(3),
    position: 'sticky',
    top: 24,
  },

  title: {
    marginBottom: theme.spacing(3),
  },

  scheduledChangeBox: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },

  scheduledChangeBoxPaymentFailed: {
    border: `1px solid ${tokens['error-400']}`,
    backgroundColor: alpha(tokens['error-400'], 0.1),
  },

  scheduledChangeBoxWarning: {
    border: `1px solid ${tokens['warning-400']}`,
    backgroundColor: alpha(tokens['warning-400'], 0.1),
  },

  scheduledChangeTitle: {
    marginBottom: theme.spacing(1),
  },

  scheduledChangeTitlePaymentFailed: {
    color: tokens['error-600'],
  },

  scheduledChangeTitleWarning: {
    color: tokens['warning-500'],
  },

  scheduledChangeDescription: {
    marginBottom: theme.spacing(1),
  },

  scheduledChangeDescriptionPaymentFailed: {
    color: tokens['error-600'],
  },

  scheduledChangeDescriptionWarning: {
    color: tokens['warning-500'],
  },

  scheduledChangeReason: {},

  scheduledChangeReasonPaymentFailed: {
    color: tokens['error-600'],
  },

  scheduledChangeReasonWarning: {
    color: tokens['warning-500'],
  },

  cancelButton: {
    marginBottom: theme.spacing(2),
  },

  supportText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },

  tableContainer: {
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: theme.palette.border.tertiary,
  },

  table: {
    tableLayout: 'fixed',
  },

  tableHead: {
    backgroundColor: tokens['midnight-950'],
  },

  unitColumn: {
    width: '30%',
  },

  includedColumn: {
    width: '25%',
  },

  overageColumn: {
    width: '45%',
  },

  editorCostBox: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '70px',
    justifyContent: 'center',
  },

  billingCaptionLeft: {
    fontSize: '0.75rem',
    textAlign: 'left',
  },

  savingsHover: {
    cursor: 'pointer',
    textAlign: 'left',
    '&:hover': {
      opacity: 0.8,
      textDecoration: 'underline',
    },
  },

  centeredBox: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '60px',
  },

  totalSection: {
    marginBottom: theme.spacing(3),
  },

  savingsText: {
    marginBottom: theme.spacing(1),
  },

  totalPrice: {
    marginBottom: theme.spacing(1),
  },

  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  changeIndicatorSection: {
    marginBottom: theme.spacing(2),
  },

  termsText: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
}));

export const usePlanCardStyles = makeStyles()((theme) => ({
  card: {
    width: '100%',
    border: '1px solid',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.background?.paper,
  },

  cursorHoverNotAllowed: {
    '&:hover': {
      cursor: 'not-allowed !important',
    },
  },

  cardEnabled: {
    cursor: 'pointer',
    opacity: 1,
  },

  cardDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },

  cardSelected: {
    borderColor: tokens['success-500'],
  },

  cardUnselected: {
    borderColor: theme.palette.border.tertiary,
  },

  formControlLabel: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    width: '100%',
  },

  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  contentSection: {
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    borderTop: '1px solid',
    display: 'flex',
    alignItems: 'center',
  },

  contentSectionSpaceBetween: {
    justifyContent: 'space-between',
  },

  contentSectionFlexStart: {
    justifyContent: 'flex-start',
  },

  contentSectionSelected: {
    borderColor: tokens['success-500'],
  },

  contentSectionUnselected: {
    borderColor: theme.palette.tx.quarterary,
  },

  userControlsContainer: {
    marginTop: theme.spacing(2),
  },

  userControlsBox: {
    marginBottom: theme.spacing(3),
  },

  userControlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },

  controlButton: {
    minWidth: theme.spacing(5),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    height: theme.spacing(5),
  },

  numberInputProps: {
    textAlign: 'center',
    minWidth: '45px',
    maxWidth: '80px',
  },

  numberInput: {
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
  },
}));

export const useCycleCardStyles = makeStyles()((theme) => ({
  formControlLabel: {
    padding: theme.spacing(2),
    width: '100%',
    border: '1px solid',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.background?.paper,
    '&:hover': {
      borderColor: 'success.main',
    },
  },

  formControlLabelEnabled: {
    cursor: 'pointer',
  },

  formControlLabelDisabled: {
    cursor: 'not-allowed',
  },

  formControlLabelSelected: {
    borderColor: tokens['success-500'],
  },

  formControlLabelUnselected: {
    borderColor: theme.palette.tx.quarterary,
  },

  labelContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  savingsChip: {
    height: 20,
    marginLeft: theme.spacing(1),
  },

  activeText: {
    marginLeft: theme.spacing(1),
  },

  savingsText: {
    marginTop: theme.spacing(0.5),
  },
}));
