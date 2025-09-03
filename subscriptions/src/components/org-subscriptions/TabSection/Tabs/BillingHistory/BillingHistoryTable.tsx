import { Box, Checkbox, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SubscriptionNameMap } from 'app-zephyr-constants';
import { tokens } from 'app-zephyr-styles/themes';
import { format } from 'date-fns';
import { Dispatch, useState } from 'react';
import { SubscriptionTier, type StripeInvoiceDto } from 'ze-sdk';
import { BillingTableActionCell } from './BillingTableActionCell';

const columnHelper = createColumnHelper<StripeInvoiceDto>();

export const BillingHistoryTable = ({
  invoices,
  selectedRows,
  setSelectedRows,
}: {
  invoices: StripeInvoiceDto[];
  selectedRows: string[];
  setSelectedRows: Dispatch<React.SetStateAction<string[]>>;
}) => {
  const [allSelected, setAllSelected] = useState(false);
  const onSelectClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, event.target.value]);
    } else {
      setSelectedRows((prevSelectedRows) => prevSelectedRows.filter((rowId) => rowId !== event.target.value));
    }
  };
  const onSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllSelected(event.target.checked);
    if (event.target.checked) {
      setSelectedRows(invoices.map((invoice) => invoice.id).filter((x): x is string => !!x));
    } else {
      setSelectedRows([]);
    }
  };
  const columns = [
    columnHelper.accessor((row) => row.id, {
      id: 'select-col',
      header: () => <Checkbox color="primary" checked={allSelected} onChange={onSelectAll} />,
      cell: (row) => {
        const id = row.getValue();
        return (
          <Checkbox color="primary" value={id} checked={!!id && selectedRows.includes(id)} onChange={onSelectClick} />
        );
      },
    }),
    columnHelper.accessor((row) => ({ number: row.number, created: row.created }), {
      id: 'invoice',
      header: 'Invoice',
      cell: (info) => {
        const { number, created } = info.getValue();

        return (
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {`#${number ?? 'N/A'}`}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {format(new Date(created * 1000), 'MMM d, yyyy')}
            </Typography>
          </Box>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        const color = status === 'paid' ? '#4CAF50' : status === 'open' ? '#FF9800' : '#F44336';
        return (
          <Box
            sx={{
              display: 'inline-block',
              bgcolor: `${color}20`,
              color: color,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              textTransform: 'capitalize',
            }}
          >
            {status}
          </Box>
        );
      },
    }),
    columnHelper.accessor('total', {
      header: 'Amount',
      cell: (info) => {
        const amount = info.getValue() / 100; // Convert cents to dollars
        return <Typography>${amount.toFixed(2)}</Typography>;
      },
    }),
    columnHelper.accessor(
      (row) =>
        // Finds metadata either by parent subscription details or by invoice lines
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        (row.parent?.subscription_details?.metadata?.tier ||
          row.lines.data.find((line) => !!line.metadata.tier)?.metadata.tier) as SubscriptionTier | undefined,
      {
        id: 'plan',
        header: 'Plan',
        cell: (info) => {
          const tier = info.getValue();

          if (!tier) {
            return null;
          }

          const result = SubscriptionNameMap[tier];

          if (!result) {
            return null;
          }

          return <Typography>{result}</Typography>;
        },
      },
    ),
    columnHelper.accessor((row) => ({ id: row.id, invoice_pdf: row.invoice_pdf }), {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const { id, invoice_pdf } = info.getValue();

        if (!invoice_pdf || !id) {
          return null;
        }

        return <BillingTableActionCell id={id} invoice_pdf={invoice_pdf} />;
      },
    }),
  ];

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Paper>
      <Table style={{ width: '100%' }}>
        <TableHead sx={{ backgroundColor: tokens['midnight-950'] }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ textAlign: 'left', padding: '12px' }}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} style={{ padding: '12px' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
