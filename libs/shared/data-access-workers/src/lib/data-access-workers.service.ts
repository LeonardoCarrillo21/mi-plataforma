import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Worker, CreateWorkerDto } from '@mi-plataforma/shared-utils';
import { tap } from 'rxjs';
import { Department } from '@mi-plataforma/shared-utils';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3333/api/employees'; // Nueva ruta profesional

  // La Signal vive aquí, así cualquier componente puede leerla
  private _workers = signal<Worker[]>([]);
  public workers = this._workers.asReadonly(); //Departmens: Department[]
  private _departments = signal<Department[]>([]);
  public departments = this._departments.asReadonly();

  getDepartments() {
    return this.http.get<Department[]>('http://localhost:3333/api/employees/departments').pipe(
      tap(depts => this._departments.set(depts))
    ).subscribe();
  }

  getWorkers() {
    return this.http.get<Worker[]>(this.apiUrl).pipe(
      tap((data) => this._workers.set(data))
    ).subscribe();
  }
  
  postWorker(worker: CreateWorkerDto) {
    return this.http.post<Worker>(`${this.apiUrl}/register-worker`, worker).pipe(
      tap(() => this.getWorkers()) // Recarga la lista automáticamente al guardar
    );
  }
  updateWorker(id: string, worker: CreateWorkerDto) {
    return this.http.patch<Worker>(`${this.apiUrl}/${id}`, worker).pipe(
      tap(() => this.getWorkers()) // Refresca la lista y las gráficas automáticamente
    );
  }

  deleteWorker(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getWorkers()) // Recarga la lista automáticamente al borrar
    );
  }
  importManyWorkers(workers: CreateWorkerDto[]) {
    return this.http.post<Worker[]>(`${this.apiUrl}/bulk`, workers).pipe(
      tap(() => this.getWorkers()) // Refresca la lista y gráficas
    );
  }
}