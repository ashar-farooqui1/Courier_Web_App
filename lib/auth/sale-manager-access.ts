/** Pages a Sale Manager may open. Every other dashboard route redirects to /dashboard. */
const SALE_MANAGER_EXACT_PATHS = ["/dashboard"];
const SALE_MANAGER_PATH_PREFIXES = ["/orders/details", "/orders/import", "/documents/return"];

export function canSaleManagerAccess(pathname: string): boolean {
  if (SALE_MANAGER_EXACT_PATHS.includes(pathname)) return true;
  return SALE_MANAGER_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
