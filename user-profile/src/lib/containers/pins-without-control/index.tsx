import { authenticated_user_profile_path } from 'app-zephyr-routes';
import { useMyPinList } from 'app-zephyr-domains/user';
import { Error } from 'app-zephyr-components/AlertContent';
import { SectionHeader } from 'app-zephyr-components/section-header';
import { Link } from 'app-zephyr-components/Link';

import { PinListSkeleton } from '../../components/pin-list/pin-list-skeleton';
import { PinList } from '../../components/pin-list';

function PinsWithoutControl() {
  const { pins, isLoading, error } = useMyPinList();

  return (
    <>
      {!!pins?.length && (
        <div>
          <SectionHeader
            title="Pinned"
            rightElement={
              <Link
                data-e2e={`show-more-pinned`}
                disabled={Boolean(isLoading || error)}
                to={authenticated_user_profile_path()}
                className="white"
              >
                Show More
              </Link>
            }
          />
          <Content pins={pins} isLoading={isLoading} error={error} />
        </div>
      )}
    </>
  );
}

function Content({ pins, isLoading, error }: ReturnType<typeof useMyPinList>) {
  if (isLoading) return <PinListSkeleton />;
  if (error) return <Error error={error} />;

  return <PinList pins={pins ?? []} />;
}

export { PinsWithoutControl };
