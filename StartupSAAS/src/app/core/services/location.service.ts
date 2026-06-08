import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface Country {
  name: string;
  code: string;
  flag: string;
}

export interface LocationNode {
  id?: number;
  name: string;
  children?: LocationNode[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private countries: Country[] = [
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' }
  ];

  private bdDataSubject = new BehaviorSubject<any>(null);
  
  constructor(private http: HttpClient) {
    this.loadBDData();
  }

  private loadBDData() {
    this.http.get('/assets/data/bangladesh-locations.json').subscribe({
      next: (data: any) => this.bdDataSubject.next(data),
      error: (err) => console.error('Error loading location data', err)
    });
  }

  getCountries() {
    return this.countries;
  }

  getHierarchy(countryName: string): Observable<LocationNode[]> {
    return this.bdDataSubject.asObservable().pipe(
      map(data => {
        if (!data) return [];
        
        // If Bangladesh or any other country (fallback to BD for demo as requested)
        const countryToUse = (countryName === 'United States') ? 'United States' : 'Bangladesh';

        if (countryToUse === 'Bangladesh') {
          return data.Bangladesh.map((div: any) => ({
            name: div.name,
            children: div.districts.map((dis: any) => ({
              name: dis.name,
              children: dis.thanas.map((t: string) => ({ name: t }))
            }))
          }));
        }
        
        if (countryToUse === 'United States') {
          return [
            { name: 'California', children: [{ name: 'Los Angeles' }, { name: 'San Francisco' }] },
            { name: 'New York', children: [{ name: 'New York City' }] }
          ];
        }
        
        return [];
      })
    );
  }

  getFlattenedHierarchy(countryName: string): Observable<LocationNode[]> {
    // Determine if we are using the fallback (Bangladesh) logic
    const isBangladeshOrFallback = countryName !== 'United States';

    return this.getHierarchy(countryName).pipe(
      map(hierarchy => {
        if (isBangladeshOrFallback) {
          // Flatten Divisions into Districts
          const allDistricts: LocationNode[] = [];
          hierarchy.forEach(division => {
            if (division.children) {
              allDistricts.push(...division.children);
            }
          });
          return allDistricts.sort((a, b) => a.name.localeCompare(b.name));
        }
        return hierarchy;
      })
    );
  }
}
