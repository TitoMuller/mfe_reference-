import { makeStyles } from 'tss-react/mui';

export const useMainStyles = makeStyles()(({ palette }) => ({
  formButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'end',
    width: '100%',
  },
  container: {
    backgroundColor: (palette.brand.gray as Record<string, string>)['900-20%'],
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    border: palette.border.tertiary,
  },
  modal: { maxWidth: 600 },
  emailVerified: {
    color: palette.tx.success.primary,
  },
  emailNotVerified: {
    color: palette.tx.error.primary,
  },
}));

export const useDefaultEmailStyles = makeStyles()(({ palette }) => ({
  defaultEmailContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: 8,
  },

  emailItems: {
    margin: '0',
    color: palette.tx.primary,
    fontSize: 14,
    paddingLeft: 16,

    li: {
      listStyle: 'none',

      span: {
        color: palette.tx.tertiary.default,
      },
    },

    'li:not(:last-child)': {
      marginBottom: 8,
    },
  },
  emailSubItem: {
    fontSize: 12,
  },
}));

export const useAdditionalEmailsStyles = makeStyles()(({ palette, spacing }) => ({
  additional: {
    color: palette.tx.primary,
  },
  emailsActions: {
    display: 'flex',
    marginTop: 2,
    flexDirection: 'row',
    gap: 12,
    button: {
      fontSize: 14,
    },
  },
  emailInputLabel: {
    fontWeight: 'bold',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  input: {
    '.MuiInputBase-root': {
      backgroundColor: palette.bg.primary.default,
      width: 350,
      marginTop: 8,
      marginBottom: 8,
      border: palette.border.secondary,
      borderRadius: 8,
      color: palette.tx.secondary.default,

      '&:before': {
        display: 'none',
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 16px',
      fontSize: spacing(2),
    },
  },
}));

export const useNotificationSectionStyles = makeStyles()(({ palette }) => ({
  container: {
    backgroundColor: palette.bg.primary.default,
    borderRadius: 16,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: palette.tx.secondary.hover,
    fontWeight: 700,
  },
  input: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 8,
    overflow: 'hidden',
    '.MuiSelect-select': {
      backgroundColor: palette.bg.secondary.default,
      padding: '12px 12px',
    },
    '.MuiSelect-select.Mui-disabled': {
      backgroundColor: 'transparent',
      padding: '12px 12px',
    },
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      borderColor: palette.border.secondary,
      borderRadius: 8,
    },
    '&:hover fieldset.MuiOutlinedInput-notchedOutline': {
      borderColor: palette.border.secondary,
    },
  },
}));
