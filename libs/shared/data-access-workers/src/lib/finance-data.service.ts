import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Department } from '@mi-plataforma/shared-utils';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3333/api/finance';

  stats = signal<any[]>([]);

  getDepartmentStats() {
    return this.http.get<any[]>(`${this.apiUrl}/stats`).pipe(
      tap(data => this.stats.set(data))
    );
  }
}