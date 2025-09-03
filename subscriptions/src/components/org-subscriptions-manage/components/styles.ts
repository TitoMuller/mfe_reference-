import { tokens } from 'app-zephyr-styles/themes';
import { makeStyles } from 'tss-react/mui';

export const useZeContentStyles = makeStyles()((theme) => ({
  mainContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },

  summaryColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  summaryRowWithIcon: {
    display: 'flex',
    alignItems: 'center',
  },

  summaryColumnWithGap: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },

  accordion: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: tokens['midnight-950'],
    '&.MuiAccordion-root::before': {
      display: 'none', // This removes the pseudo-element causing the border line
    },
  },

  accordionDisabled: {
    opacity: 0.6,
  },

  accordionSummary: {
    borderRadius: theme.borderRadius.lg,
    border: 'none',
    '& .MuiAccordionSummary-expandIconWrapper': {
      transform: 'none !important', // This prevents any transform - flipping
    },
  },

  accordionSummaryContent: {
    borderRadius: theme.borderRadius.lg,
  },

  summaryTitleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },

  summaryTitleWithIcon: {
    display: 'flex',
    gap: theme.spacing(1),
  },

  summaryContentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },

  continueSection: {
    marginTop: theme.spacing(2),
    alignItems: 'center',
    gap: theme.spacing(2),
  },

  checkoutGrid: {
    width: '100%',
    backgroundColor: theme.palette.bg.secondary.default,
    borderRadius: theme.borderRadius.lg,
    border: theme.palette.border.secondary,
  },

  expandIcon: {
    display: 'flex',
    gap: theme.spacing(0.5),
    color: theme.palette.tx.quarterary,
  },

  savingsTextSuccess: {
    color: theme.palette.tx.success.primary,
  },

  savingsTextSecondary: {
    color: theme.palette.tx.secondary.default,
  },
}));
