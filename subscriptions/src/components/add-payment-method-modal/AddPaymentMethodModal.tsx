import { Box, Modal } from '@mui/material';
import { useStyles } from './styles';
import { AddPaymentMethodModalContent, AddPaymentMethodModalContentProps } from './AddPaymentMethodModalContent';
import { AttachPaymentMethodParams } from 'ze-sdk';

export const AddPaymentMethodModal = ({
  children,
  open,
  onClose,
  onSubmit,
  defaultValues,
  defaultLocked,
}: {
  children?: React.ReactNode;
  open: boolean;
  onClose: (params?: AttachPaymentMethodParams) => void;
  onSubmit?: (params: AttachPaymentMethodParams) => void;
  defaultValues?: AddPaymentMethodModalContentProps['defaultValues'];
  defaultLocked?: boolean;
}) => {
  const { classes } = useStyles();

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
      className={classes.modal}
    >
      <Box className={classes.modalContent}>
        {children ? (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>{children}</>
        ) : (
          <AddPaymentMethodModalContent
            handleClose={onClose}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            defaultLocked={defaultLocked}
          />
        )}
      </Box>
    </Modal>
  );
};

export default AddPaymentMethodModal;
