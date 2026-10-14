import React from "react";

/** Red outline added to an input whose value failed validation. */
export const fieldErrorInputClass = "!border-red-400 focus:!ring-red-200";

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-[10px] font-bold text-red-600 mt-1 ml-1">{message}</p>;
}
