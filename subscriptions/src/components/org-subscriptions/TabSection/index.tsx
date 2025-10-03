import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useListPaymentMethods } from 'ze-sdk';
import { PaymentMethodTab } from './Tabs/PaymentMethodsTab';
import { BillingHistoryTab } from './Tabs/BillingHistory/BillingHistoryTab';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index.toString()}`}
      aria-labelledby={`subscription-tab-${index.toString()}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `subscription-tab-${index.toString()}`,
    'aria-controls': `subscription-tabpanel-${index.toString()}`,
  };
}

export function TabSection({ organizationName }: { organizationName: string }) {
  const [value, setValue] = useState(0);
  const { data: paymentMethods } = useListPaymentMethods({
    organizationName,
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="subscription tabs">
          {/* <Tab label="Usage" {...a11yProps(0)} /> */}
          <Tab label="Payment Methods" {...a11yProps(0)} />
          <Tab label="Billing History" {...a11yProps(1)} />
          {/* <Tab label="Notifications" {...a11yProps(3)} /> */}
        </Tabs>
      </Box>
      {/* <TabPanel value={value} index={0}>
        Usage Content
      </TabPanel> */}
      <TabPanel value={value} index={0}>
        <PaymentMethodTab paymentMethods={paymentMethods?.data} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <BillingHistoryTab />
      </TabPanel>
      {/* <TabPanel value={value} index={3}>
        Notifications Content
      </TabPanel> */}
    </Box>
  );
}
