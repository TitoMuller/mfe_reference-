import { Error } from 'app-zephyr-components/AlertContent';
import { SectionHeader } from 'app-zephyr-components/section-header';
import { PinListSkeleton } from '../../components/pin-list/pin-list-skeleton';
import { PinList } from '../../components/pin-list';
import { useUserPinList } from 'app-zephyr-domains/user';

interface Props {
  username: string | undefined;
}

function UserPins(props: Props) {
  const { pins, isLoading, error } = useUserPinList(props);

  if (isLoading) return <PinListSkeleton />;
  if (error) return <Error error={error} />;
  if (!pins?.length) return null;

  return (
    <div>
      <SectionHeader title="Pinned" />
      <PinList pins={pins} />
    </div>
  );
}

export { UserPins };
