/** Backend `OrderStatus` enum values from Swagger (PascalCase). */
export const ORDER_STATUS_API_VALUES = [
  "Draft",
  "Finalize",
  "Booked",
  "PickedUp",
  "ArrivedAtOrigin",
  "OutForDestination",
  "OutForDelivery",
  "ArrivedAtDestination",
  "HaltAdviceSent",
  "Delivered",
  "Cancelled",
  "ReturnConfirm",
  "ParcelReturned",
  "ReturnInTransit",
  "ReturnOutForDelivery",
  "ReturnReceivedAtOrigin",
  "RequestForReattempt",
  "Reattempted",
  "ShipmentLost",
  "Damage",
  "TransitLost",
] as const;

export type OrderStatusApiValue = (typeof ORDER_STATUS_API_VALUES)[number];

/** Dropdown labels mapped to exact Swagger enum strings. */
export const ORDER_STATUS_OPTIONS: ReadonlyArray<{
  label: string;
  value: OrderStatusApiValue;
}> = [
  { label: "Booked", value: "Booked" },
  { label: "Picked up", value: "PickedUp" },
  { label: "Arrived At Origin", value: "ArrivedAtOrigin" },
  { label: "Out for Destination", value: "OutForDestination" },
  { label: "Out for Delivery", value: "OutForDelivery" },
  { label: "Arrived at Destination", value: "ArrivedAtDestination" },
  { label: "Halt - Advice sent", value: "HaltAdviceSent" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Return Confirm", value: "ReturnConfirm" },
  { label: "Parcel Returned", value: "ParcelReturned" },
  { label: "Return in Transit", value: "ReturnInTransit" },
  { label: "Return Out for delivery", value: "ReturnOutForDelivery" },
  { label: "Return Received at Origin", value: "ReturnReceivedAtOrigin" },
  { label: "Request for Reattempt", value: "RequestForReattempt" },
  { label: "Reattempted", value: "Reattempted" },
  { label: "Shipment Lost", value: "ShipmentLost" },
  { label: "Damage", value: "Damage" },
  { label: "Transit Lost", value: "TransitLost" },
  { label: "Draft", value: "Draft" },
  { label: "Finalize", value: "Finalize" },
];

const ORDER_STATUS_API_VALUE_SET = new Set<string>(ORDER_STATUS_API_VALUES);

const ORDER_STATUS_LABEL_BY_VALUE = new Map(
  ORDER_STATUS_OPTIONS.map((option) => [option.value, option.label])
);

export function isOrderStatusApiValue(value: unknown): value is OrderStatusApiValue {
  return typeof value === "string" && ORDER_STATUS_API_VALUE_SET.has(value);
}

export function getOrderStatusLabel(value: OrderStatusApiValue): string {
  return ORDER_STATUS_LABEL_BY_VALUE.get(value) ?? value;
}

/** Formats API / legacy numeric status values for display in the UI. */
export function formatOrderStatusLabel(status: string | null | undefined): string {
  const raw = status?.trim();
  if (!raw) return "—";

  if (isOrderStatusApiValue(raw)) {
    return getOrderStatusLabel(raw);
  }

  const numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric < ORDER_STATUS_API_VALUES.length) {
    return getOrderStatusLabel(ORDER_STATUS_API_VALUES[numeric]);
  }

  return raw;
}
