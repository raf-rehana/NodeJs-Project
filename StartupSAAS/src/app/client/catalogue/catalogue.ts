import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { Service, ServiceCategory } from '../../core/models/service';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RedirectService } from '../../core/services/redirect.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogue.html',
  styleUrls: ['./catalogue.css']
})
export class CatalogueComponent implements OnInit {
  categories = signal<ServiceCategory[]>([]);
  services = signal<Service[]>([]);
  activeCategoryId = signal<string | number | null>(null);
  searchQuery = signal<string>('');

  filteredServices = computed(() => {
    let filtered = this.services();
    
    if (this.activeCategoryId()) {
      filtered = filtered.filter(s => String(s.categoryId) === String(this.activeCategoryId()));
    }
    
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    
    return filtered;
  });

  groupedServices = computed(() => {
    const groups: { category: ServiceCategory, services: Service[] }[] = [];
    
    const relevantCategories = this.activeCategoryId() 
      ? this.categories().filter(c => String(c.id) === String(this.activeCategoryId()))
      : this.categories();

    relevantCategories.forEach(cat => {
      const catServices = this.filteredServices().filter(s => String(s.categoryId) === String(cat.id));
      if (catServices.length > 0) {
        groups.push({ category: cat, services: catServices });
      }
    });
    
    return groups;
  });

  activeCategoryName = computed(() => {
    const cat = this.categories().find(c => String(c.id) === String(this.activeCategoryId()));
    return cat ? cat.name : 'All Services';
  });

  constructor(
    private serviceCatalogue: ServiceCatalogueService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  ngOnInit() {
    this.serviceCatalogue.getCategories().subscribe((data: ServiceCategory[]) => {
      this.categories.set(data);
      
      this.route.queryParams.subscribe(params => {
        if (params['categoryId']) {
          this.activeCategoryId.set(params['categoryId']);
        }
        this.loadServices();
      });
    });
  }

  loadServices() {
    this.serviceCatalogue.getServices().subscribe((data: Service[]) => {
      this.services.set(data);
    });
  }

  filterByCategory(categoryId: string | number | null) {
    this.activeCategoryId.set(categoryId);
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
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
