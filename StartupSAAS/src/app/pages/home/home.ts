import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { SiteContentService } from '../../core/services/site-content.service';
import { SiteContent } from '../../core/models/site-content';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { ServiceCategory } from '../../core/models/service';
import { RedirectService } from '../../core/services/redirect.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  siteContent = signal<SiteContent | null>(null);
  categories = signal<ServiceCategory[]>([]);
  groupedServices = signal<{ category: ServiceCategory, services: any[] }[]>([]);
  isLoading = signal(true);

  constructor(
    private siteContentService: SiteContentService,
    private catalogueService: ServiceCatalogueService,
    private authService: AuthService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  ngOnInit() {
    this.loadSiteContent();
    this.loadHomeData();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkScroll();
    });
  }

  loadHomeData() {
    this.catalogueService.getCategories().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.catalogueService.getServices().subscribe({
          next: (services) => {
            const groups = cats.map(category => {
              const catServices = services.filter(s => s.categoryId === category.id).slice(0, 4);
              return { category, services: catServices };
            }).filter(group => group.services.length > 0);
            
            this.groupedServices.set(groups);
            this.isLoading.set(false);
            this.checkScroll();
          },
          error: (err) => {
            console.error('Failed to load services:', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.isLoading.set(false);
      }
    });
  }

  checkScroll() {
    const url = this.router.url;
    let targetId = '';
    
    if (url.includes('/services')) targetId = 'packages';
    else if (url.includes('/about')) targetId = 'about';

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const yOffset = -100;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }

  loadSiteContent() {
    this.isLoading.set(true);
    this.siteContentService.getActiveContent().subscribe({
      next: (content) => {
        if (content) {
          this.siteContent.set(content);
        } else {
          this.siteContent.set(this.getDefaultContent());
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading site content:', error);
        this.siteContent.set(this.getDefaultContent());
        this.isLoading.set(false);
      }
    });
  }

  private getDefaultContent(): SiteContent {
    return {
      id: 1,
      heroBadge: 'STARTUPSAAS PLATFORM',
      heroTitle: 'Engineered for Scale. Built for Speed.',
      heroSubtitle: 'Abstract your operational complexity. From legal compliance and infrastructure to digital acquisition—StartupSAAS provides a unified API for your business growth.',
      heroImageUrl: 'assets/images/hero_office.jpg',
      heroFeatures: [
        { icon: 'bi-shield-check', text: 'Enterprise Grade' },
        { icon: 'bi-lightning-charge', text: 'High Velocity' },
        { icon: 'bi-bezier2', text: 'Scalable Package' }
      ],
      aboutBadge: 'Overview',
      aboutTitle: 'B2B Infrastructure, Unified.',
      aboutDescription: 'StartupSAAS is not an agency. It is a service orchestration layer. We eliminate the operational friction that degrades your time-to-market.',
      aboutImageUrl: 'assets/images/lumi-two.jpg',
      visionTitle: 'The Package',
      visionDescription: 'We merge advanced digital workflows with vetted human expertise. Track progress, authorize deployments, and manage billing through a single pane of glass.',
      missionTitle: 'Operational Efficiency',
      missionDescription: 'We handle the compliance, development, and marketing overhead so your engineering and product teams can focus on core intellectual property.',
      experienceYears: '10+ Years',
      servicesTitle: 'Standard Deployment Tiers',
      servicesSubtitle: "Predictable resource allocation. Subscribe to a tier that matches your current operational requirements.",
      services: [
        {
          icon: 'bi-laptop',
          title: 'Foundation Node',
          description: 'Establish baseline digital infrastructure with essential security.',
          linkText: 'Initialize',
          linkUrl: '/client/payments',
          color: 'secondary',
          features: [
            "Corporate Site Deployment",
            "Managed DNS & Hosting",
            "Identity Setup",
            "SEO Scaffolding",
            "SLA Support"
          ]
        },
        {
          icon: 'bi-graph-up-arrow',
          title: 'Scaling Cluster',
          description: 'High-availability marketing and dynamic web application services.',
          linkText: 'Deploy',
          linkUrl: '/client/payments',
          color: 'dark',
          features: [
            "Custom App Package",
            "Quarterly Marketing Bursts",
            "Omnichannel Brand Sync",
            "Visual Identity System",
            "Priority Support Tier"
          ]
        },
        {
          icon: 'bi-rocket-takeoff',
          title: 'Enterprise Pipeline',
          description: 'Full-stack legal, operational, and software engineering.',
          linkText: 'Authenticate',
          linkUrl: '/client/payments',
          color: 'primary',
          features: [
            "Legal & Compliance Registry",
            "Full Stack Software Eng.",
            "Cross-Platform Mobile Apps",
            "Sustained User Acquisition",
            "Dedicated Ops Manager"
          ]
        }
      ],
      ctaTitle: 'Ready to initialize?',
      ctaDescription: 'Integrate StartupSAAS into your operational workflow today.',
      ctaButtonText: 'View Packages',
      ctaButtonLink: '/packages',
      socialProofTitle: 'Trusted Ecosystem',
      socialLinks: [
        { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'bi-linkedin' },
        { name: 'GitHub', url: 'https://github.com', icon: 'bi-github' }
      ],
      isActive: true,
      updatedAt: new Date().toISOString()
    };
  }

  onServiceAction(service: any) {
    const targetUrl = service.linkUrl;
    if (this.authService.isLoggedIn()) {
      this.router.navigate([targetUrl]);
    } else {
      this.redirectService.setReturnUrl(targetUrl);
      this.router.navigate(['/login']);
    }
  }

  onServiceRequest(service: any) {
    const targetUrl = '/client/request-form';
    const queryParams = { serviceId: service.id };
    if (this.authService.isLoggedIn()) {
      this.router.navigate([targetUrl], { queryParams });
    } else {
      const fullUrl = this.router.createUrlTree([targetUrl], { queryParams }).toString();
      this.redirectService.setReturnUrl(fullUrl);
      this.router.navigate(['/login']);
    }
  }
}
