
import { useState, useCallback } from "react";
import { checkBDFraud } from "@/api/bdcourier";
import { toast } from "@/hooks/use-toast";

// Type for courier stats used throughout project.
export interface CourierRatioData {
  [courier: string]: {
    name: string;
    total_parcel: number;
    success_parcel: number;
    cancelled_parcel: number;
    success_ratio: number;
  };
}

interface UseBulkCourierRatioReturn {
  dialogOpen: boolean;
  courierData: CourierRatioData | null;
  checkedPhones: string[];
  openDialogForPhones: (phones: string[]) => void;
  closeDialog: () => void;
}

export function useBulkCourierRatio(): UseBulkCourierRatioReturn {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [courierData, setCourierData] = useState<CourierRatioData | null>(null);
  const [checkedPhones, setCheckedPhones] = useState<string[]>([]);

  // Main entry point: call with list of phones, opens dialog/modal when ready
  const openDialogForPhones = useCallback(async (phones: string[]) => {
    if (!phones.length) {
      toast({
        title: "BDCourier Ratio",
        description: "No phone numbers found.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "BDCourier Check",
      description: `Checking ${phones.length} phone${phones.length > 1 ? "s" : ""}...`,
      variant: "default",
    });

    let aggregate: CourierRatioData = {};
    let phonesChecked: string[] = [];
    
    for (const phone of phones) {
      try {
        const data = await checkBDFraud(phone);
        if (data?.courierData) {
          for (const courier of ["pathao", "steadfast", "redx", "paperfly", "parceldex", "summary"]) {
            if (!aggregate[courier]) aggregate[courier] = {
              name: data.courierData[courier]?.name ?? courier,
              total_parcel: 0,
              success_parcel: 0,
              cancelled_parcel: 0,
              success_ratio: 0,
            };
            if (data.courierData[courier]) {
              aggregate[courier].total_parcel += data.courierData[courier].total_parcel || 0;
              aggregate[courier].success_parcel += data.courierData[courier].success_parcel || 0;
              aggregate[courier].cancelled_parcel += data.courierData[courier].cancelled_parcel || 0;
              aggregate[courier].success_ratio += data.courierData[courier].success_ratio || 0;
            }
          }
          phonesChecked.push(phone);
        }
      } catch {
        // ignore error, don't add phone to checkedPhones
      }
    }

    if (!phonesChecked.length) {
      toast({ title: "BDCourier", description: "No BD Courier data found for given numbers.", variant: "destructive" });
      setDialogOpen(false);
      setCourierData(null);
      setCheckedPhones([]);
      return;
    }

    setCourierData(aggregate);
    setCheckedPhones(phonesChecked);
    setDialogOpen(true);
  }, []);

  function closeDialog() {
    setDialogOpen(false);
    setCourierData(null);
    setCheckedPhones([]);
  }

  return {
    dialogOpen,
    courierData,
    checkedPhones,
    openDialogForPhones,
    closeDialog,
  };
}
