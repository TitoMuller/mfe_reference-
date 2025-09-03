import { useState } from 'react';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';

interface BillingTableActionCellProps {
  id: string;
  invoice_pdf: string | null;
}

export const BillingTableActionCell = ({ id, invoice_pdf }: BillingTableActionCellProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (invoicePdfUrl: string | null) => {
    if (invoicePdfUrl) {
      window.open(invoicePdfUrl, '_blank');
    }
    handleMenuClose();
  };

  return (
    <Box>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        aria-controls={anchorEl ? `invoice-menu-${id}` : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? 'true' : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`invoice-menu-${id}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
            },
          },
        }}
      >
        {invoice_pdf && (
          <MenuItem
            onClick={() => {
              handleDownload(invoice_pdf);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FileDownloadIcon fontSize="small" />
              <span>Download Invoice</span>
            </Box>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
