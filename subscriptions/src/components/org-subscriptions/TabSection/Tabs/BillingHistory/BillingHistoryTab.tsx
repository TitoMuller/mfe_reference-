import { Box, Typography } from '@mui/material';
import { useTypedParams } from 'app-zephyr-routes';
import { useListInvoices } from 'ze-sdk';
import { BillingHistoryTable } from './BillingHistoryTable';

import { useState } from 'react';

export const BillingHistoryTab = () => {
  const { organization: organizationName } = useTypedParams();
  if (!organizationName) {
    throw new Error('Organization name is required');
  }
  const { data: invoices } = useListInvoices({ organizationName: organizationName });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  return (
    <Box sx={(theme) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) })}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Billing History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>{/* <Button>Pay overdue invoices</Button> */}</Box>
      </Box>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          border: theme.palette.border.secondary,
          borderRadius: theme.borderRadius.lg,
          overflowY: 'auto',
        })}
      >
        {invoices ? (
          <BillingHistoryTable invoices={invoices.data} setSelectedRows={setSelectedRows} selectedRows={selectedRows} />
        ) : (
          <Box>
            <Typography>No Invoices Found</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
