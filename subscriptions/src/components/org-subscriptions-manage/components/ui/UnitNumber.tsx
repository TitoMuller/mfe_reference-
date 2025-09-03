import { Typography } from '@mui/material';
import { formatPenniesToPriceNumber } from '../../money-functions/money';

export interface UnitNumberProps {
  value: number;
  unit: string;
  price?: boolean;
  infiniteDecimals?: boolean;
  nocolor?: boolean;
  small?: boolean;
}

export function UnitNumber(props: UnitNumberProps) {
  return (
    <span>
      {formatPenniesToPriceNumber(props.value, props.price ? 'USD' : null, props.infiniteDecimals ? 10 : 2)}
      <Typography
        component="span"
        variant={props.small ? 'caption' : 'body2'}
        color={props.nocolor ? 'inherit' : 'text.secondary'}
      >
        /{props.unit}
      </Typography>
    </span>
  );
}
