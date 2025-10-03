import { useState } from 'react';

import { Empty, Error } from 'app-zephyr-components/AlertContent';
import { SectionHeader } from 'app-zephyr-components/section-header';
import { Link } from 'app-zephyr-components/Link';
import { useMyPinList } from 'app-zephyr-domains/user';

import { PinListSkeleton } from '../../components/pin-list/pin-list-skeleton';
import { PinList } from '../../components/pin-list';
import { PinOptionsModal } from '../pin-options-modal';

function MyPins() {
  const { pins, isLoading, error } = useMyPinList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setModalOpen = () => {
    setIsModalOpen(true);
  };
  const setModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <SectionHeader
        title="Pinned"
        rightElement={
          <Link
            data-e2e="section-pinned-customize-pins-link"
            disabled={Boolean(isLoading || error)}
            onClick={setModalOpen}
            className={'white'}
          >
            Customize pins
          </Link>
        }
      />
      <Content pins={pins} isLoading={isLoading} error={error} />
      <PinOptionsModal isOpen={isModalOpen} onClose={setModalClose} pins={pins} />
    </div>
  );
}

function Content({ pins, isLoading, error }: ReturnType<typeof useMyPinList>) {
  if (isLoading) return <PinListSkeleton />;
  if (error) return <Error error={error} />;
  if (!pins?.length) {
    const emptyMessage = 'There are currently no pinned items. Please customize your pins to have them displayed here.';
    return <Empty isRender={true} title={emptyMessage} />;
  }

  return <PinList pins={pins} />;
}

export { MyPins };
