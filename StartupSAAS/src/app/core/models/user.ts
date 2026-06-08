export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'SUPER_ADMIN';
  password?: string;
  phone?: string;
  companyName?: string;
  businessType?: string;
  plan?: string;
  tenantId?: string;
  designation?: string;
  avatar?: string;
  address?: string;
  district?: string;
  policeStation?: string;
  country?: string;
  division?: string;
  village?: string;
  thana?: string;
}
