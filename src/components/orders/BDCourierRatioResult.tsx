
import React from "react";

interface CourierStats {
  name: string;
  total: number;
  success: number;
  cancel: number;
}

interface Props {
  courierData: {
    pathao?: {
      name: string; total_parcel: number; success_parcel: number; cancelled_parcel: number;
    }
    steadfast?: {
      name: string; total_parcel: number; success_parcel: number; cancelled_parcel: number;
    }
    redx?: {
      name: string; total_parcel: number; success_parcel: number; cancelled_parcel: number;
    }
    paperfly?: {
      name: string; total_parcel: number; success_parcel: number; cancelled_parcel: number;
    }
    parceldex?: {
      name: string; total_parcel: number; success_parcel: number; cancelled_parcel: number;
    }
    summary: {
      total_parcel: number;
      success_parcel: number;
      cancelled_parcel: number;
      success_ratio: number;
    }
  }
  onClose: () => void;
  checkedPhones: string[];
}

const COURIER_KEYS = [
  { key: "pathao", label: "Pathao" },
  { key: "steadfast", label: "Steadfast" },
  { key: "redx", label: "Redx" },
  { key: "paperfly", label: "Paperfly" },
  // "parceldex" can be added if needed
];

const BDCourierRatioResult: React.FC<Props> = ({ courierData, checkedPhones, onClose }) => (
  <div className="w-full max-w-lg p-4">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-lg font-semibold">BD Courier Search Details</h2>
      <button className="text-gray-500 hover:text-red-600 px-2 py-1 rounded" onClick={onClose}>✕</button>
    </div>
    <div className="mb-2 text-xs text-muted-foreground">
      Checked phone numbers: {checkedPhones.join(", ")}
    </div>
    <table className="table-fixed w-full border text-sm mb-3 bg-white">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 text-left">Courier</th>
          <th className="py-2 text-center">Total</th>
          <th className="py-2 text-center">Success</th>
          <th className="py-2 text-center">Cancel</th>
        </tr>
      </thead>
      <tbody>
        {COURIER_KEYS.map(({key, label}) => {
          const c = courierData[key as keyof typeof courierData];
          return (
            <tr key={key}>
              <td className="py-1 font-medium">{label}</td>
              <td className="py-1 text-center">{c?.total_parcel ?? 0}</td>
              <td className="py-1 text-center">{c?.success_parcel ?? 0}</td>
              <td className="py-1 text-center">{c?.cancelled_parcel ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
    <div className="border-t pt-2 text-right text-sm font-semibold text-gray-700">
      Summary: Total Parcels: {courierData.summary.total_parcel ?? 0}, Success Parcels: {courierData.summary.success_parcel ?? 0}, Cancel Parcels: {courierData.summary.cancelled_parcel ?? 0}
    </div>
  </div>
);

export default BDCourierRatioResult;
