import { normalizeRoleName } from "@/lib/auth/map-role";
import type { Admin } from "@/types/admin";

const SALE_MANAGER_NAMES = new Set(["salemanager", "salesmanager"]);

export function isSaleManagerAdmin(
  admin: Pick<Admin, "roleName" | "designation">
): boolean {
  return [admin.roleName, admin.designation].some((value) =>
    SALE_MANAGER_NAMES.has(normalizeRoleName(value ?? ""))
  );
}
