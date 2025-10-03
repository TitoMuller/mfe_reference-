import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
/**
 * Skeleton for the LeftSideMenu and the 2 content Tables.
 */
export const SubscriptionsManageSkeleton = () => (
  <Stack spacing={6} direction="row">
    <Stack spacing={2} direction={'row'} sx={{ paddingTop: 4 }}>
      <Skeleton animation="wave" height={300} width={300} sx={{ transform: 'none' }} />
      <Skeleton animation="wave" height={300} width={300} sx={{ transform: 'none' }} />
      <Skeleton animation="wave" height={300} width={300} sx={{ transform: 'none' }} />
    </Stack>
  </Stack>
);
