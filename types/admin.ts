export interface Admin {
  adminId: number;
  adminName: string;
  cnic: string;
  contactNumber: string;
  adminEmail: string;
  designation: string;
  adminImage: string | null;
  roleId: number;
  roleName: string;
}

export interface UpdateAdminPayload {
  AdminName: string;
  CNIC: string;
  ContactNumber: string;
  AdminEmail: string;
  Designation: string;
  RoleId: number;
  AdminImage?: File | null;
}
