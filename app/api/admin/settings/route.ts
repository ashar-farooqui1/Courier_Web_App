import { NextResponse } from "next/server";
import { getAdminSettings, updateAdminSettings } from "@/lib/api/admin-settings";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { UpdateAdminSettingsPayload } from "@/lib/types/admin-settings";

function getErrorStatus(error: unknown): number {
  return error instanceof Error && "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
}

/** GET — proxies /api/Admin/settings */
export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin settings";
    return NextResponse.json(
      { error: parseApiErrorMessage(message, message) },
      { status: getErrorStatus(error) }
    );
  }
}

/** PUT — proxies /api/Admin/settings */
export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateAdminSettingsPayload;

    const message = await updateAdminSettings({
      ntn: String(body.ntn ?? "").trim(),
      taxInvoiceNo: String(body.taxInvoiceNo ?? "").trim(),
      gstNumber: String(body.gstNumber ?? "").trim(),
      strn: String(body.strn ?? "").trim(),
      fuelFactor: Number(body.fuelFactor) || 0,
      petrolCurrentPrice: Number(body.petrolCurrentPrice) || 0,
      petrolBasePrice: Number(body.petrolBasePrice) || 0,
      capitalGSTPercentage: Number(body.capitalGSTPercentage) || 0,
      ajkgstPercentage: Number(body.ajkgstPercentage) || 0,
      kpkgstPercentage: Number(body.kpkgstPercentage) || 0,
      balochistanGSTPercentage: Number(body.balochistanGSTPercentage) || 0,
      punjabGSTPercentage: Number(body.punjabGSTPercentage) || 0,
      sindhGSTPercentage: Number(body.sindhGSTPercentage) || 0,
    });

    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update admin settings";
    return NextResponse.json(
      { error: parseApiErrorMessage(message, message) },
      { status: getErrorStatus(error) }
    );
  }
}
