
import React from "react";

interface CourierStatsRowProps {
  label: string;
  stat?: {
    total_parcel: number;
    success_parcel: number;
    cancelled_parcel: number;
  };
}
const CourierStatsRow: React.FC<CourierStatsRowProps> = ({ label, stat }) => (
  <tr>
    <td className="py-1 font-medium">{label}</td>
    <td className="py-1 text-center">{stat?.total_parcel ?? 0}</td>
    <td className="py-1 text-center">{stat?.success_parcel ?? 0}</td>
    <td className="py-1 text-center">{stat?.cancelled_parcel ?? 0}</td>
  </tr>
);

// Props match hook return values for the current stats plus modal handlers
interface Props {
  open: boolean;
  courierData: any;
  checkedPhones: string[];
  onClose: () => void;
}

const labelMap = {
  pathao: "Pathao",
  steadfast: "Steadfast",
  redx: "Redx",
  paperfly: "Paperfly",
};

const BdcourierRatioDialog: React.FC<Props> = ({
  open,
  courierData,
  checkedPhones,
  onClose
}) => {
  if (!open || !courierData) return null;

  const summary = courierData.summary ?? {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
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
            {Object.entries(labelMap).map(([key, label]) => (
              <CourierStatsRow
                key={key}
                label={label}
                stat={courierData[key]}
              />
            ))}
          </tbody>
        </table>
        <div className="border-t pt-2 text-right text-sm font-semibold text-gray-700">
          Summary: Total Parcels: {summary.total_parcel ?? 0}, Success Parcels: {summary.success_parcel ?? 0}, Cancel Parcels: {summary.cancelled_parcel ?? 0}
        </div>
      </div>
    </div>
  );
};

export default BdcourierRatioDialog;
