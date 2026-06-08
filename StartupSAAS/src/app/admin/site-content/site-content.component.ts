import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteContentService } from '../../core/services/site-content.service';
import { SiteContent, ServiceCard, SocialLink, HeroFeature } from '../../core/models/site-content';

@Component({
  selector: 'app-site-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './site-content.component.html'
})
export class SiteContentComponent implements OnInit {
  private readonly siteContentService = inject(SiteContentService);

  public siteContent = signal<SiteContent | null>(null);
  public isLoading = signal(true);
  public isSaving = signal(false);
  public activeTab = signal('hero');
  public message = signal('');
  public messageType = signal<'success' | 'error'>('success');

  public tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'bi-image' },
    { id: 'about', label: 'About Section', icon: 'bi-info-circle' },
    { id: 'services', label: 'Services Section', icon: 'bi-grid' },
    { id: 'cta', label: 'CTA Section', icon: 'bi-megaphone' },
    { id: 'social', label: 'Social Proof', icon: 'bi-share' }
  ];

  ngOnInit() {
    this.loadContent();
  }

  loadContent() {
    this.isLoading.set(true);
    this.siteContentService.getSiteContent().subscribe({
      next: (content) => {
        this.siteContent.set(content || this.getDefaultContent());
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading site content:', error);
        this.showMessage('Error loading content', 'error');
        this.isLoading.set(false);
      }
    });
  }

  getDefaultContent(): SiteContent {
    return {
      id: 1,
      heroBadge: 'NEXT GEN SERVICE HUB',
      heroTitle: 'You Bring the <span class="text-primary">Idea</span>. We Build the <span class="text-primary">Business</span>.',
      heroSubtitle: 'Have money and a vision? We handle the rest. From Trade Licenses and Legal Paperwork to Web Development and Digital Marketing — StartupSAAS is your complete startup partner.',
      heroImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      heroFeatures: [
        { icon: 'bi-check-circle-fill', text: 'Expert Teams' },
        { icon: 'bi-check-circle-fill', text: '24/7 Support' },
        { icon: 'bi-check-circle-fill', text: 'Secure Portal' }
      ],
      aboutBadge: 'Who We Are',
      aboutTitle: 'Driving Innovation with a Purpose',
      aboutDescription: 'At StartupSAAS, we believe that professional service management should be seamless, transparent, and scalable for every business.',
      aboutImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      visionTitle: 'Our Vision',
      visionDescription: 'To redefine the global landscape of B2B service delivery by creating an intelligent, transparent, and highly accessible ecosystem.',
      missionTitle: 'Our Mission',
      missionDescription: 'Our mission is to eliminate the operational hurdles that stifle business growth.',
      experienceYears: '10+ Years',
      servicesTitle: 'Startup Packages',
      servicesSubtitle: 'We don\'t just provide services; we build foundations. Choose a package that covers everything from your legal identity to your digital presence.',
      services: [
        { icon: 'bi-rocket-takeoff', title: 'Launch Packages', description: 'Full startup readiness including Trade Licenses, Web/Mobile Apps, and Business Registration.', linkText: 'View Packages', linkUrl: '/packages', color: 'primary' },
        { icon: 'bi-globe', title: 'Digital Presence', description: 'High-end Web development, E-commerce platforms, and SEO to get your brand seen globally.', linkText: 'Explore Web', linkUrl: '/packages', color: 'success' },
        { icon: 'bi-megaphone', title: 'Growth & Marketing', description: 'Complete digital marketing, social media management, and brand identity kits for scale.', linkText: 'Grow Now', linkUrl: '/packages', color: 'warning' }
      ],
      ctaTitle: 'Ready to start your journey?',
      ctaDescription: 'Join hundreds of successful businesses already using StartupSAAS.',
      ctaButtonText: 'Explore All Packages',
      ctaButtonLink: '/packages',
      socialProofTitle: 'Join our growing community',
      socialLinks: [
        { name: 'Facebook', url: 'https://facebook.com', icon: 'bi-facebook' },
        { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'bi-linkedin' },
        { name: 'GitHub', url: 'https://github.com', icon: 'bi-github' }
      ],
      isActive: true,
      updatedAt: new Date().toISOString()
    };
  }

  saveContent() {
    const payload = this.siteContent();
    if (!payload) return;
    
    this.isSaving.set(true);
    payload.updatedAt = new Date().toISOString();

    const request = payload.id 
      ? this.siteContentService.updateSiteContent(payload.id, payload)
      : this.siteContentService.createSiteContent(payload);

    request.subscribe({
      next: (res) => {
        if (!payload.id && res) this.siteContent.set(res);
        this.showMessage('Content saved successfully!', 'success');
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error saving content:', error);
        this.showMessage('Error saving content', 'error');
        this.isSaving.set(false);
      }
    });
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 3000);
  }

  updateContent(field: keyof SiteContent, value: any) {
    this.siteContent.update(c => c ? { ...c, [field]: value } : null);
  }

  // Feature Updates
  addHeroFeature() {
    this.siteContent.update(c => {
      if (!c) return null;
      return { ...c, heroFeatures: [...c.heroFeatures, { icon: 'bi-check', text: 'New Feature' }] };
    });
  }
  removeHeroFeature(index: number) {
    this.siteContent.update(c => {
      if (!c) return null;
      const f = [...c.heroFeatures]; f.splice(index, 1);
      return { ...c, heroFeatures: f };
    });
  }
  updateHeroFeature(index: number, field: keyof HeroFeature, value: string) {
    this.siteContent.update(c => {
      if (!c) return null;
      const f = [...c.heroFeatures]; f[index] = { ...f[index], [field]: value };
      return { ...c, heroFeatures: f };
    });
  }

  // Service Updates
  addServiceCard() {
    this.siteContent.update(c => {
      if (!c) return null;
      return { ...c, services: [...c.services, { icon: 'bi-star', title: 'New Service', description: 'Desc', linkText: 'Link', linkUrl: '#', color: 'primary' }] };
    });
  }
  removeServiceCard(index: number) {
    this.siteContent.update(c => {
      if (!c) return null;
      const s = [...c.services]; s.splice(index, 1);
      return { ...c, services: s };
    });
  }
  moveServiceCard(index: number, direction: 'up' | 'down') {
    this.siteContent.update(c => {
      if (!c) return null;
      const s = [...c.services];
      if (direction === 'up' && index > 0) {
        [s[index], s[index - 1]] = [s[index - 1], s[index]];
      } else if (direction === 'down' && index < s.length - 1) {
        [s[index], s[index + 1]] = [s[index + 1], s[index]];
      }
      return { ...c, services: s };
    });
  }
  updateServiceCard(index: number, field: keyof ServiceCard, value: string) {
    this.siteContent.update(c => {
      if (!c) return null;
      const s = [...c.services]; s[index] = { ...s[index], [field]: value };
      return { ...c, services: s };
    });
  }

  // Social Updates
  addSocialLink() {
    this.siteContent.update(c => {
      if (!c) return null;
      return { ...c, socialLinks: [...c.socialLinks, { name: 'Platform', url: 'https://', icon: 'bi-link' }] };
    });
  }
  removeSocialLink(index: number) {
    this.siteContent.update(c => {
      if (!c) return null;
      const l = [...c.socialLinks]; l.splice(index, 1);
      return { ...c, socialLinks: l };
    });
  }
  updateSocialLink(index: number, field: keyof SocialLink, value: string) {
    this.siteContent.update(c => {
      if (!c) return null;
      const l = [...c.socialLinks]; l[index] = { ...l[index], [field]: value };
      return { ...c, socialLinks: l };
    });
  }

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }
}
