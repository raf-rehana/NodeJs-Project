export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
}

export interface Service {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  deliveryDays: string;
  isActive: boolean;
  requiredDocuments?: RequiredDocument[];
}

export interface RequiredDocument {
  id: number;
  docName: string;
  isMandatory: boolean;
  description: string;
  acceptedFormats?: string[];
}
