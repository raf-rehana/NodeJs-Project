export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}
