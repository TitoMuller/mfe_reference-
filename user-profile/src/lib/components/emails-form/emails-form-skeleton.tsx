import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useMainStyles } from './styles';

export const EmailsFormSkeleton = () => {
  const { classes } = useMainStyles();

  return (
    <Box maxWidth="690px">
      <div className={classes.container}>
        <Skeleton width={400} />
        <Stack spacing={0.5}>
          <Skeleton width={150} height={16} />
          <Skeleton width={300} height={12} />
          <Skeleton width={150} height={16} />
          <Skeleton width={300} height={12} />
        </Stack>
        <Stack spacing={0.5}>
          <Skeleton width={400} />
          <Skeleton width={300} height={16} />
        </Stack>
        <Stack spacing={0.5}>
          <Skeleton width={300} />
          <Skeleton width={350} height={60} />
          <Skeleton width={100} height={16} />
        </Stack>
      </div>
    </Box>
  );
};
