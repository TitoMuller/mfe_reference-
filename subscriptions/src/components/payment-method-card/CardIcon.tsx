import { CreditCard } from '@mui/icons-material';
import { DiscoverIcon, VisaIcon } from 'app-zephyr-icons';
const CARD_BRAND_ICONS = {
  visa: <VisaIcon />,
  // mastercard: 'mastercard-icon',
  // amex: 'amex-icon',
  discover: <DiscoverIcon />,
};
export const CardIcon = ({ brand }: { brand: string | undefined }) => {
  if (brand && Object.keys(CARD_BRAND_ICONS).includes(brand)) {
    return CARD_BRAND_ICONS[brand as keyof typeof CARD_BRAND_ICONS];
  }
  return <CreditCard />;
};
