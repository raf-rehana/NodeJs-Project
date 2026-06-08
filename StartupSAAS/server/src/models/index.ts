import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Helper interface for Model typing
export interface BaseModelAttr {
  id?: number;
  [key: string]: any;
}

export const User = sequelize.define<Model<any, any>>('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  companyName: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  division: { type: DataTypes.STRING },
  district: { type: DataTypes.STRING },
  policeStation: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  avatar: { type: DataTypes.TEXT },
  designation: { type: DataTypes.STRING }
}, { tableName: 'users', timestamps: false });

export const Category = sequelize.define<Model<any, any>>('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'categories', timestamps: false });

export const Service = sequelize.define<Model<any, any>>('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DOUBLE },
  categoryId: { type: DataTypes.INTEGER },
  documentRequirements: { type: DataTypes.JSONB },
  deliveryTime: { type: DataTypes.STRING }
}, { tableName: 'services', timestamps: false });

export const ServiceRequest = sequelize.define<Model<any, any>>('ServiceRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  serviceId: { type: DataTypes.INTEGER },
  planName: { type: DataTypes.STRING },
  amount: { type: DataTypes.DOUBLE },
  status: { type: DataTypes.STRING },
  workedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  assignedTo: { type: DataTypes.INTEGER },
  employeeNotes: { type: DataTypes.TEXT },
  priority: { type: DataTypes.STRING },
  attachments: { type: DataTypes.JSONB }
}, { tableName: 'service_requests', timestamps: false });

export const Notification = sequelize.define<Model<any, any>>('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdAt: { type: DataTypes.STRING }
}, { tableName: 'notifications', timestamps: false });

export const Subscription = sequelize.define<Model<any, any>>('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DOUBLE },
  features: { type: DataTypes.JSONB },
  description: { type: DataTypes.TEXT },
  billingCycle: { type: DataTypes.STRING }
}, { tableName: 'subscriptions', timestamps: false });

export const Payment = sequelize.define<Model<any, any>>('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clientId: { type: DataTypes.INTEGER },
  client: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  item: { type: DataTypes.STRING },
  amount: { type: DataTypes.DOUBLE },
  method: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  tranId: { type: DataTypes.STRING },
  bankTranId: { type: DataTypes.STRING },
  currency: { type: DataTypes.STRING },
  requestId: { type: DataTypes.INTEGER }
}, { tableName: 'payments', timestamps: false });

export const ThemeSettings = sequelize.define<Model<any, any>>('ThemeSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  primaryColor: { type: DataTypes.STRING },
  secondaryColor: { type: DataTypes.STRING },
  accentColor: { type: DataTypes.STRING },
  logoUrl: { type: DataTypes.TEXT },
  font: { type: DataTypes.STRING },
  fontFamily: { type: DataTypes.STRING },
  mode: { type: DataTypes.STRING },
  siteName: { type: DataTypes.STRING }
}, { tableName: 'theme_settings', timestamps: false });

export const SiteContent = sequelize.define<Model<any, any>>('SiteContent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING },
  heroBadge: { type: DataTypes.STRING },
  heroTitle: { type: DataTypes.TEXT },
  heroSubtitle: { type: DataTypes.TEXT },
  heroImageUrl: { type: DataTypes.TEXT },
  heroFeatures: { type: DataTypes.JSONB },
  aboutBadge: { type: DataTypes.STRING },
  aboutTitle: { type: DataTypes.STRING },
  aboutDescription: { type: DataTypes.TEXT },
  aboutImageUrl: { type: DataTypes.TEXT },
  visionTitle: { type: DataTypes.STRING },
  visionDescription: { type: DataTypes.TEXT },
  missionTitle: { type: DataTypes.STRING },
  missionDescription: { type: DataTypes.TEXT },
  experienceYears: { type: DataTypes.STRING },
  servicesTitle: { type: DataTypes.STRING },
  servicesSubtitle: { type: DataTypes.TEXT },
  services: { type: DataTypes.JSONB },
  ctaTitle: { type: DataTypes.STRING },
  ctaDescription: { type: DataTypes.TEXT },
  ctaButtonText: { type: DataTypes.STRING },
  ctaButtonLink: { type: DataTypes.STRING },
  socialProofTitle: { type: DataTypes.STRING },
  socialLinks: { type: DataTypes.JSONB },
  isActive: { type: DataTypes.BOOLEAN },
  updatedAt: { type: DataTypes.STRING }
}, { tableName: 'site_content', timestamps: false });

export const AuditLog = sequelize.define<Model<any, any>>('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  timestamp: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER },
  userName: { type: DataTypes.STRING },
  userRole: { type: DataTypes.STRING },
  action: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT }
}, { tableName: 'audit_logs', timestamps: false });

export const KnowledgeArticle = sequelize.define<Model<any, any>>('KnowledgeArticle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.STRING },
  updatedAt: { type: DataTypes.STRING }
}, { tableName: 'knowledge_articles', timestamps: false });

export const modelRegistry: Record<string, typeof Model> = {
  'users': User,
  'categories': Category,
  'services': Service,
  'service-requests': ServiceRequest,
  'notifications': Notification,
  'subscriptions': Subscription,
  'payments': Payment,
  'theme-settings': ThemeSettings,
  'site-content': SiteContent,
  'auditLogs': AuditLog,
  'knowledgeBase': KnowledgeArticle
};
