import { NextResponse } from "next/server";
import { uploadClientDocuments } from "@/lib/api/clients";
import { parseApiErrorMessage } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ id: string }> };

function parseClientId(id: string): number | null {
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId < 1) return null;
  return clientId;
}

/** Proxies POST /api/Client/{clientId}/UploadDocument */
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clientId = parseClientId(id);

  if (clientId === null) {
    return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
  }

  try {
    const formData = await request.formData();

    const logo = formData.get("Logo");
    const cnicFront = formData.get("CnicFront");
    const cnicBack = formData.get("CnicBack");
    const blankCheque = formData.get("BlankCheque");

    const hasFile = [logo, cnicFront, cnicBack, blankCheque].some(
      (file) => file instanceof File && file.size > 0
    );

    if (!hasFile) {
      return NextResponse.json({ error: "Please select at least one file to upload" }, { status: 400 });
    }

    const message = await uploadClientDocuments(clientId, {
      logo: logo instanceof File && logo.size > 0 ? logo : null,
      cnicFront: cnicFront instanceof File && cnicFront.size > 0 ? cnicFront : null,
      cnicBack: cnicBack instanceof File && cnicBack.size > 0 ? cnicBack : null,
      blankCheque: blankCheque instanceof File && blankCheque.size > 0 ? blankCheque : null,
    });

    return NextResponse.json({ message });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload client documents";
    const status =
      error instanceof Error && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;
    return NextResponse.json(
      { error: parseApiErrorMessage(message, message) },
      { status }
    );
  }
}
