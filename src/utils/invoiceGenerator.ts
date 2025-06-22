import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { Order } from '@/types';

// Interface for invoice items
export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

// Interface for shipping address
export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
}

// Interface for invoice order
export interface InvoiceOrder {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  items: InvoiceItem[];
  total: number;
  shippingAddress: ShippingAddress;
  trackingId?: string;
}

/**
 * Utility to generate and download invoice PDF.
 * @param order Invoice data
 * @param onDownloadComplete Optional callback
 */
export function generateInvoice(
  order: InvoiceOrder,
  onDownloadComplete?: () => void
) {
  const element = document.createElement('div');
  element.innerHTML = `
    <div class="invoice-container">
      <div class="header">
        <h1>Dreamer Shop 🏪</h1>
        <p>Your Trusted Online Store</p>
        <p>Phone: 01810-308171</p>
      </div>
      <div class="invoice-info">
        <div class="invoice-details">
          <p><strong>Order No:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${format(
            typeof order.createdAt === 'string'
              ? new Date(order.createdAt)
              : order.createdAt,
            'PPP'
          )}</p>
          ${order.trackingId ? `<p><strong>Tracking ID:</strong> ${order.trackingId}</p>` : ''}
        </div>
        <div class="customer-details">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
          <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
        </div>
      </div>
      <div class="items-table">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>৳${item.price.toFixed(2)}</td>
                <td>৳${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>Total:</strong></td>
              <td>৳${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div class="footer">
        <p>Thank you for shopping with Dreamer Shop!</p>
        <p>Contact us at 01810-308171 for any queries.</p>
        <p class="generated-at">Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .invoice-container {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #2c3e50;
    }
    .header h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 26px;
    }
    .header p {
      color: #7f8c8d;
      margin: 5px 0 0;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 20px;
    }
    .invoice-details, .customer-details {
      flex: 1;
    }
    .customer-details h3 {
      color: #2c3e50;
      margin-bottom: 8px;
      font-size: 18px;
    }
    .invoice-details p, .customer-details p {
      margin: 4px 0;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
      font-size: 14px;
    }
    th {
      background-color: #2c3e50;
      color: white;
    }
    .text-right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      background-color: #f8f9fa;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      color: #7f8c8d;
      font-size: 12px;
    }
    .generated-at {
      font-size: 10px;
      color: #95a5a6;
    }
    @media print {
      @page { margin: 1.5cm; }
      .header, th {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  element.appendChild(style);

  // Configure html2pdf options
  const opt = {
    margin: 0.5,
    filename: `invoice-${order.orderNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    if (onDownloadComplete) onDownloadComplete();
  });
}

/**
 * Download single invoice
 * @param order Order data from Orders.tsx
 */
export const downloadSingleInvoice = async (order: Order) => {
  const invoiceOrder: InvoiceOrder = {
    id: order.ID,
    orderNumber: order.ID,
    createdAt: order.CreatedAt,
    items: [
      {
        name: order['Order-Items'],
        quantity: 1,
        price: order.Amount
      }
    ],
    total: order.Amount,
    shippingAddress: {
      fullName: order.Name,
      phone: order.Number,
      address: order.Address || 'N/A'
    },
    trackingId: order['Steadfast-tracking-id'] || undefined
  };
  generateInvoice(invoiceOrder);
};

/**
 * Download bulk invoices
 * @param orders Array of order data from Orders.tsx
 */
export const downloadBulkInvoices = async (orders: Order[]) => {
  for (const order of orders) {
    await downloadSingleInvoice(order);
    // Add delay between downloads to prevent browser overload
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};
