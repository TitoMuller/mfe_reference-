import { useStyles } from './styles';
import { PinCard } from '../pin-card';
import { UserPin } from 'ze-api-contract/user-v2/user-pins/get-user-pins';

interface PinsListProps {
  pins: UserPin[];
}

export function PinList({ pins }: PinsListProps) {
  const { classes } = useStyles();

  return (
    <div className={classes.list}>
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </div>
  );
}
