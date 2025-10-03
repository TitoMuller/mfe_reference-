import { UserPin } from 'ze-api-contract/user-v2/user-pins/get-user-pins';
import Modal from '@mui/material/Modal';
import { useUserPinOptions } from 'app-zephyr-domains/user';
import { useStyles } from './styles';
import { Empty, Error } from 'app-zephyr-components/AlertContent';
import { PinOptionsForm } from 'app-zephyr-forms';

interface PinModalFormProps {
  pins?: UserPin[];
  isOpen?: boolean;
  onClose: () => void;
}

export const PinOptionsModal = ({ pins = [], isOpen = false, onClose }: PinModalFormProps) => {
  const { classes } = useStyles();

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className={classes.modalContainer}>
        <h2>Edit Pinned</h2>
        <h3>Select up to six public organization, projects or applications you'd like to show to anyone.</h3>
        <Content pins={pins} onClose={onClose} />
      </div>
    </Modal>
  );
};

const Content = ({ pins = [], onClose }: PinModalFormProps) => {
  const { error, isLoading, pinOptions } = useUserPinOptions();

  if (error) return <Error error={error} />;
  if (!pinOptions?.length) {
    const emptyTitle =
      'There are currently no organizations, projects or applications. Please create one to be able to pin.';
    return <Empty isRender={true} title={emptyTitle} />;
  }

  return <PinOptionsForm isLoading={isLoading} pins={pins} pinOptions={pinOptions} onClose={onClose} />;
};
