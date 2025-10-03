import Skeleton from '@mui/material/Skeleton';
import { useStyles as useContainerStyles } from './styles';
import { useStyles } from '../pin-card/styles';

export function PinListSkeleton() {
  const { classes } = useStyles();
  const { classes: containerClasses } = useContainerStyles();

  return (
    <div className={containerClasses.list}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className={classes.root} key={index}>
          <div className={classes.header}>
            <Skeleton animation="wave" width={80} height={24} />
            <Skeleton animation="wave" width={60} height={30} />
          </div>
          <div className={classes.breadcrumb}>
            <Skeleton animation="wave" width={120} height={24} />
          </div>
          <div className={classes.description}>
            <Skeleton animation="wave" width={240} height={18} />
            <Skeleton animation="wave" width={220} height={18} />
          </div>
          <div className={classes.footer}>
            <Skeleton animation="wave" width={50} height={24} />
            <Skeleton animation="wave" width={50} height={24} />
            <Skeleton animation="wave" width={50} height={24} />
          </div>
        </div>
      ))}
    </div>
  );
}
