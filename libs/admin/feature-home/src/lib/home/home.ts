import { Component, OnInit, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
//empleados
import { WorkerService } from '@mi-plataforma/shared/data-access-workers';
//graficas
import { FinanceService } from '@mi-plataforma/shared/data-access-workers';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'lib-home',
  standalone: true,
  imports: [CommonModule,BaseChartDirective],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  public miVariableSignal =  signal<string>('Hola desde Signal');
  private workerService = inject(WorkerService);
  private financeService = inject(FinanceService);
  // Usamos computed para que se recalculen solas si la lista de workers cambia
  totalEmployees = computed(() => this.workerService.workers().length);
  
  totalPayroll = computed(() => 
    this.workerService.workers().reduce((acc, curr) => acc + (curr.salary || 0), 0)
  );

  avgSalary = computed(() => 
    this.totalEmployees() > 0 ? this.totalPayroll() / this.totalEmployees() : 0
  );
  constructor() {
    effect(() => {
      // Este log se disparará dos veces:
      // 1. Al iniciar (imprimirá [])
      // 2. Cuando llegue la data de NestJS (imprimirá tus stats)
      console.log('El Signal ha cambiado:', this.financeService.stats());
    });
  }
  ngOnInit() {
    this.workerService.getWorkers(); // Aseguramos que tenemos datos
    this.financeService.getDepartmentStats().subscribe();
  }

  // Configuramos la gráfica
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartType: ChartType = 'bar';
  
  // Transformamos los datos del servicio para Chart.js
  chartData = computed<ChartData<'bar'>>(() => ({
    labels: this.financeService.stats().map(s => s.name),
    datasets: [
      { 
        data: this.financeService.stats().map(s => s.totalSalary), 
        label: 'Gasto por Departamento',
        backgroundColor: '#3b82f6'
      }
    ]
  }));

}