
import React from "react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";

// Define minimal 'Order' type for invoice generation
interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}
interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  division?: string;
  district?: string;
  upazila?: string;
  bkashNumber?: string;
  bkashTransactionId?: string;
}
interface Order {
  orderNumber?: string;
  id: string;
  createdAt: string;
  paymentMethod: string;
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: ShippingAddress;
}

interface InvoiceProps {
  order: Order;
  onDownloadComplete?: () => void;
}

const InvoiceButton: React.FC<InvoiceProps> = ({ order, onDownloadComplete }) => {
  const generateInvoice = () => {
    const element = document.createElement("div");
    element.innerHTML = `
      <div class="invoice-container">
        <div class="header">
          <h1>Organik Shop BD</h1>
          <p>Your Trusted Organic Store</p>
          <p>Phone: 01810-308171</p>
        </div>

        <div class="invoice-info">
          <div class="invoice-details">
            <p><strong>Order No:</strong> ${order.orderNumber || order.id}</p>
            <p><strong>Date:</strong> ${format(new Date(order.createdAt), "PPP")}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          <div class="customer-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
            <p><strong>Email:</strong> ${order.shippingAddress.email || "N/A"}</p>
            <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
            ${
              order.shippingAddress.division
                ? `<p><strong>Division:</strong> ${order.shippingAddress.division}</p>`
                : ""
            }
            ${
              order.shippingAddress.district
                ? `<p><strong>District:</strong> ${order.shippingAddress.district}</p>`
                : ""
            }
            ${
              order.shippingAddress.upazila
                ? `<p><strong>Upazila:</strong> ${order.shippingAddress.upazila}</p>`
                : ""
            }
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
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                <td>৳${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right"><strong>Delivery Charge:</strong></td>
                <td>৳${order.deliveryCharge.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td>৳${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${
          order.paymentMethod === "bkash"
            ? `
          <div class="payment-details">
            <h3>Payment Information</h3>
            <p><strong>bKash Number:</strong> ${order.shippingAddress.bkashNumber}</p>
            <p><strong>Transaction ID:</strong> ${order.shippingAddress.bkashTransactionId}</p>
          </div>
        `
            : ""
        }

        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>For any queries, please contact our customer support.</p>
          <p>Phone: 01810-308171</p>
          <p class="generated-at">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const style = document.createElement("style");
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
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #2c3e50;
      }
      .header h1 {
        color: #2c3e50;
        margin: 0;
        font-size: 28px;
      }
      .header p {
        color: #7f8c8d;
        margin: 5px 0 0;
      }
      .invoice-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      .invoice-details, .customer-details {
        flex: 1;
      }
      .customer-details h3 {
        color: #2c3e50;
        margin-bottom: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
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
      .payment-details {
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 5px;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        color: #7f8c8d;
      }
      .generated-at {
        font-size: 12px;
        color: #95a5a6;
      }
      @media print {
        @page { margin: 2cm; }
        .header, th {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;
    element.appendChild(style);

    const opt = {
      margin: 1,
      filename: `invoice-${order.orderNumber || order.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      });
  };

  return (
    <button
      onClick={generateInvoice}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download Invoice
    </button>
  );
};

export default InvoiceButton;
