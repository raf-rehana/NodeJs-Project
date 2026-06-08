import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RedirectService } from '../../core/services/redirect.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './packages.html',
  styleUrl: './packages.css'
})
export class PackagesComponent implements OnInit {
  selectedCategory = signal<string>('all');

  categories = [
    { id: 'all', label: 'All Packages', icon: 'bi-grid' },
    { id: 'launch', label: 'Startup Launch', icon: 'bi-rocket-takeoff' },
    { id: 'web', label: 'Web & App', icon: 'bi-laptop' },
    { id: 'marketing', label: 'Marketing', icon: 'bi-megaphone' },
    { id: 'legal', label: 'Legal & Compliance', icon: 'bi-file-earmark-text' },
    { id: 'design', label: 'Branding & Design', icon: 'bi-palette' },
  ];

  howItWorks = [
    { icon: 'bi-box-seam', title: 'Select Package', desc: 'Pick the subscription that aligns with your operational phase.' },
    { icon: 'bi-person-workspace', title: 'Consultation', desc: 'A dedicated project lead reviews your baseline requirements.' },
    { icon: 'bi-braces-asterisk', title: 'Development', desc: 'Our engineering and legal teams process your request stack.' },
    { icon: 'bi-rocket-takeoff', title: 'Deployment', desc: 'Your business assets go live with sustained post-launch SLAs.' },
  ];

  packagesData = [
    {
      id: 1, category: 'launch', badge: 'MOST POPULAR', badgeClass: 'bg-dark text-white',
      name: 'A-to-Z Launchpad', tagline: 'Comprehensive setup. From zero to operational inside 30 days.',
      price: 350000, currency: 'BDT ', period: 'one-time', icon: 'bi-rocket-takeoff',
      accent: '#212529', accentLight: '#f8f9fa',
      features: ['Full Business Formation & Registration','Trade License (RJSC / City Corp)','Custom Web + Mobile App','Logo, Branding & Identity Kit','Social Media Profiles Setup (5 Platforms)','1 Year Digital Marketing Strategy','Domain, Hosting & Business Email','Dedicated Business Launch Manager','12 Months Priority Support']
    },
    {
      id: 2, category: 'launch', badge: 'GROWTH', badgeClass: 'bg-primary text-white',
      name: 'Growth Accelerator', tagline: 'For digital-native businesses ready to scale infrastructure.',
      price: 150000, currency: 'BDT ', period: 'one-time', icon: 'bi-graph-up-arrow',
      accent: '#0d6efd', accentLight: '#eef5ff',
      features: ['E-Commerce / Custom Web Platform','3 Months Digital Marketing','Social Media Management (3 Platforms)','Logo & Brand Identity','Business Email Setup','SEO Foundation Setup','6 Months Priority Support']
    },
    {
      id: 3, category: 'web', badge: 'STARTER', badgeClass: 'bg-secondary text-white',
      name: 'Digital Foundation', tagline: 'Secure your professional online presence efficiently.',
      price: 50000, currency: 'BDT ', period: 'one-time', icon: 'bi-globe2',
      accent: '#6c757d', accentLight: '#f8f9fa',
      features: ['Professional 5-Page Website','Domain & Hosting (1 Year)','Business Email Setup (3 Accounts)','Mobile Responsive Design','Basic SEO Optimization','3 Months Technical Support']
    },
    {
      id: 4, category: 'web', badge: 'ADVANCED', badgeClass: 'bg-dark text-white',
      name: 'E-Commerce Pro', tagline: 'Deploy a robust, high-volume transactional storefront.',
      price: 99000, currency: 'BDT ', period: 'one-time', icon: 'bi-bag-check',
      accent: '#212529', accentLight: '#f8f9fa',
      features: ['Full E-Commerce Platform (100+ Products)','Payment Gateway Integration (bKash, Card, Nagad)','Inventory & Order Management','Mobile App (Android)','SSL Security Certificate','Admin Dashboard & Analytics','6 Months Support']
    },
    {
      id: 5, category: 'marketing', badge: 'RETAINER', badgeClass: 'bg-primary text-white',
      name: 'Digital Growth Sub', tagline: 'Sustained user acquisition and targeted lead generation.',
      price: 29000, currency: 'BDT ', period: '/month', icon: 'bi-megaphone-fill',
      accent: '#0d6efd', accentLight: '#eef5ff',
      features: ['Facebook & Instagram Ads Management','Google Ads Campaign Setup','Monthly Content Creation (16 Posts)','SEO & Keyword Optimization','Email Marketing (up to 5K subscribers)','Monthly Performance Reports']
    },
    {
      id: 6, category: 'legal', badge: 'COMPLIANCE', badgeClass: 'bg-secondary text-white',
      name: 'Compliance Pack', tagline: 'Ensure strict adherence to regulatory and corporate laws.',
      price: 39000, currency: 'BDT ', period: 'one-time', icon: 'bi-file-earmark-check',
      accent: '#6c757d', accentLight: '#f8f9fa',
      features: ['Business Name Registration (RJSC)','Trade License (City Corp / Union Parishad)','TIN Certificate Application','VAT Registration (if required)','Bank Account Setup Guidance','Document Filing & Notarization']
    },
    {
      id: 7, category: 'design', badge: 'BRANDING', badgeClass: 'bg-dark text-white',
      name: 'Identity System', tagline: 'Construct a durable and professional visual brand system.',
      price: 24000, currency: 'BDT ', period: 'one-time', icon: 'bi-palette-fill',
      accent: '#212529', accentLight: '#f8f9fa',
      features: ['Custom Logo Design (3 Concepts)','Brand Color Palette & Typography','Business Card Design','Letterhead & Invoice Template','Social Media Banner Pack (10 Templates)','Brand Guidelines Document','Source Files (AI/PSD)']
    },
    {
      id: 8, category: 'web', badge: 'ENTERPRISE', badgeClass: 'bg-primary text-white',
      name: 'Enterprise Package', tagline: 'Full-stack software engineering for complex applications.',
      price: 499000, currency: 'BDT ', period: 'from', icon: 'bi-building-gear',
      accent: '#0d6efd', accentLight: '#eef5ff',
      features: ['Custom Web + Mobile App (iOS & Android)','AI-Powered Features Integration','Enterprise-Grade Security & Compliance','Multi-Tenant Package','Admin & Analytics Dashboard','API Integration & Third-party Connections','24/7 Dedicated Support (1 Year)']
    },
  ];

  filteredPackages = computed(() => {
    if (this.selectedCategory() === 'all') return this.packagesData;
    return this.packagesData.filter(p => p.category === this.selectedCategory());
  });

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubscribe(pkg: any) {
    const targetUrl = '/client/payments';
    if (this.authService.isLoggedIn()) {
      this.router.navigate([targetUrl]);
    } else {
      this.redirectService.setReturnUrl(targetUrl);
      this.router.navigate(['/login']);
    }
  }
}
