// import { useFormContext } from 'react-hook-form';
import { Box, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
import type { StripePaymentMethodDto } from 'ze-sdk';
import { PaymentMethodDetails } from '../../payment-method-card';
import { Controller } from 'react-hook-form';

export function PaymentMethodSelector({ paymentMethods }: { paymentMethods: StripePaymentMethodDto[] }) {
  // const { watch } = useFormContext<SubscriptionInputs>();
  // const selectedPaymentMethod = watch('paymentMethod');

  return (
    <Stack spacing={2}>
      <Controller
        name="paymentMethod"
        rules={{
          required: 'Please select a payment method',
        }}
        render={({ field }) => (
          <RadioGroup {...field} sx={(theme) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) })}>
            {paymentMethods.map((method) => (
              <Box key={method.id}>
                <FormControlLabel
                  sx={{
                    width: '100%',
                    flexGrow: 1,
                    '& .MuiFormControlLabel-label': {
                      flexGrow: 1,
                    },
                  }}
                  value={method.id}
                  control={<Radio />}
                  label={<PaymentMethodDetails paymentMethod={method} />}
                />
              </Box>
            ))}
          </RadioGroup>
        )}
      />
    </Stack>
  );
}
