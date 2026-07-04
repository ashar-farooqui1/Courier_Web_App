import { NextResponse } from "next/server";
import { onboardClient, uploadClientLogo } from "@/lib/api/clients";
import { parseApiErrorMessage } from "@/lib/api/errors";
import type { OnboardClientRequest } from "@/lib/types/onboard-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OnboardClientRequest;

    if (!body.client?.clientName?.trim()) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const result = await onboardClient(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to onboard client";
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

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const clientId = Number(formData.get("clientId"));
    const logo = formData.get("logo");

    if (!Number.isInteger(clientId) || clientId < 1) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    if (!(logo instanceof File) || logo.size === 0) {
      return NextResponse.json({ error: "Logo file is required" }, { status: 400 });
    }

    await uploadClientLogo(clientId, logo);
    return NextResponse.json({ message: "Client logo uploaded successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload client logo";
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
