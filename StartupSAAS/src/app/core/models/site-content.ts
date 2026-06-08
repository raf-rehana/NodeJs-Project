export interface SiteContent {
  id?: number;
  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroFeatures: HeroFeature[];
  
  // About Section
  aboutBadge: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutImageUrl: string;
  visionTitle: string;
  visionDescription: string;
  missionTitle: string;
  missionDescription: string;
  experienceYears: string;
  
  // Services Section
  servicesTitle: string;
  servicesSubtitle: string;
  services: ServiceCard[];
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  
  // Social Proof Section
  socialProofTitle: string;
  socialLinks: SocialLink[];
  
  // Metadata
  isActive: boolean;
  updatedAt?: string;
}

export interface HeroFeature {
  icon: string;
  text: string;
}

export interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  color: string;
  features?: string[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
