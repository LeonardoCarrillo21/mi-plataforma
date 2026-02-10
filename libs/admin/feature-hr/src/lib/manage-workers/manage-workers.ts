import { signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateWorkerDto, Worker } from '@mi-plataforma/shared-utils';
// apps/admin-dashboard/src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { WorkerService } from '@mi-plataforma/shared/data-access-workers'; // <--- ¡Importación profesional!
import * as XLSX from 'xlsx';

@Component({
  standalone: true,
  selector: 'app-manage-workers',
  imports: [CommonModule, FormsModule], // Importante para el formulario
  templateUrl: './manage-workers.html',
})
export class ManageWorkers implements OnInit {
  // Inicializamos el objeto usando nuestra Interface compartida
  private workerService = inject(WorkerService);
  
  // 1. Definimos la señal para el término de búsqueda
  searchTerm = signal('');

  // 3. Traemos la señal de trabajadores desde el servicio
  workers = this.workerService.workers; //solo lectura con Departaments[]
  departments = this.workerService.departments; // solo lectura <--- Traemos la signal de depts
  
  //control del formulario Crear/Editar
  showForm = false;
  isEditing = false;
  //id del trabajador seleccionado para editar
  selectedWorkerId: string | null = null;

  //barra de carga de importacion
  isImporting = signal(false);
  importProgress = signal(0);

  // Modelo para el formulario Crear/Editar
  workerModel: CreateWorkerDto = { //solo puede recibir Departments String[]
    name: '',
    email: '',
    salary: 0,
    department_ids: [],
  };

  constructor() {
    effect(() => {
      console.log('Los trabajadores cambiaron:', this.workers());
    });
  }
  // 2. Creamos una señal computada que se actualiza sola
  filteredWorkers = computed(() => {
    // Obtenemos el término de búsqueda actual 
    const term = this.searchTerm().toLowerCase().trim();
    const allWorkers = this.workerService.workers();//solo lectura con Departaments[]

    if (!term) return allWorkers;

    return allWorkers.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        w.email.toLowerCase().includes(term) ||
        (w.role && w.role.toLowerCase().includes(term)) ||
        (w.departments &&
          w.departments.some((d) =>
            d.name.toLowerCase().includes(term),
        )), // Buscar en nombres de departamentos
    );
  });


  abrirFormularioNuevo() {
    this.cancelarEdicion(); // Limpia cualquier dato previo
    this.showForm = true;
  }

  ngOnInit() {
    this.workerService.getWorkers(); // Carga inicial
    this.workerService.getDepartments(); // Carga inicial de departamentos
  }

  // Método para enviar datos al backend
  enviarDatos() {
    if (this.isEditing && this.selectedWorkerId) {
      this.workerService
        .updateWorker(this.selectedWorkerId, this.workerModel)
        .subscribe({
          next: () => {
            alert('Trabajador actualizado');
            this.cancelarEdicion();
          },
        });
    } else {
      if (this.workerModel.salary <= 0) {
        alert('El salario debe ser mayor a cero'); // Validación rápida en Frontend
        return;
      }
      console.log('Enviando datos del trabajador:', this.workerModel);
      this.workerService.postWorker(this.workerModel).subscribe({
        next: (res) => {
          this.workerService.getWorkers(); // Carga inicial
          alert('¡Trabajador guardado con éxito!');
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          alert('Hubo un error al conectar con la API');
          // Si la DB rechaza el dato, aquí capturamos el mensaje
          console.error('Error de la DB:', err.error.message);
          alert('Error de validación: El servidor rechazó los datos.');
        },
      });
    }
  }
  //metodo para editar un trabajador
  prepararEdicion(worker: Worker) {
    this.isEditing = true;
    this.selectedWorkerId = worker.id;
    this.showForm = true;
    this.workerModel = { 
      name: worker.name,
      email: worker.email,
      salary: worker.salary,
      department_ids: worker.departments
        ? worker.departments.map((d) => d.id)
        : [],
     };
    // Hacemos scroll hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Al cancelar o terminar, ocultamos el formulario
  cancelarEdicion() {
    this.isEditing = false;
    this.showForm = false; // <--- Ocultar al cancelar
    this.selectedWorkerId = null;
    this.resetForm();
  }

  //Método para eliminar un trabajador
  eliminarTrabajador(id: string) {
    if (confirm('¿Estás seguro de eliminar este trabajador?')) {
      this.workerService.deleteWorker(id).subscribe({
        next: () => {
          // console.log('Respuesta de la API al eliminar:', res);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('Hubo un error al eliminar el trabajador');
        },
      });
    }
  }
  private resetForm() {
    this.workerModel = {
      name: '',
      email: '',
      salary: 0,
      department_ids: [],
    };
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isImporting.set(true);
    this.importProgress.set(10); // Iniciamos el progreso

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const ab = e.target.result;
        const wb = XLSX.read(ab, { type: 'array' });
        this.importProgress.set(40); // Lectura completada
        const sheetName = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
        
        
        const depts = this.workerService.departments(); //arreglo de Departaments[]
        // Mapeamos los datos del Excel a nuestro DTO
        // El Excel debe tener columnas: name, email, salary, department_name

        const workersToImport = data.map((row: any) => {
          // Buscamos el departamento por nombre (sin importar mayúsculas/minúsculas)
          const deptNames = row.departments_name?.toString()
            .toLowerCase()
            .split(',')
            .map((name: string) => name.trim());

          const foundDept = depts.filter(d => deptNames.includes(d.name.toLowerCase()));
          
          const department_ids_found = foundDept.map(d => d.id);

          

          return {
            name: row.name,
            email: row.email,
            salary: Number(row.salary),
            department_ids: department_ids_found.length > 0 ? department_ids_found : null, // Si no lo encuentra, va como nulo o puedes lanzar error
          };
        });
        const invalidRows = workersToImport.filter((w) => !w.department_ids);
        if (invalidRows.length > 0) {
          alert(
            `Error: Algunos departamentos en el Excel no existen en el sistema.`,
          );
          return;
        }
        this.importProgress.set(70); // Mapeo completado
        this.workerService.importManyWorkers(workersToImport).subscribe({
          next: () => {
            alert('¡Importación masiva completada con éxito!');
            this.importProgress.set(100);
            setTimeout(() => {
              this.isImporting.set(false);
              alert('¡Importación masiva completada!');
            }, 500);
          },
          error: (err) => {
            alert('Error al importar. Revisa el formato.');
            this.isImporting.set(false);
          },
        });
      } catch (error) {
        this.isImporting.set(false);
        alert('Archivo de Excel inválido');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  descargarPlantilla() {
    // 1. Definimos los encabezados
    const encabezados = [
      {
        name: 'Ejemplo: Juan Perez',
        email: 'juan@mail.com',
        salary: 3000,
        departments_name: 'Ventas,Tecnología', // Nombres separados por coma
      },
    ];

    // 2. Creamos el libro y la hoja
    const ws = XLSX.utils.json_to_sheet(encabezados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    // 3. (Opcional) Agregamos una segunda hoja con los nombres de departamentos válidos
    const deptsData = this.workerService
      .departments()
      .map((d) => ({ 'Departamentos Disponibles': d.name }));
    const wsDepts = XLSX.utils.json_to_sheet(deptsData);
    XLSX.utils.book_append_sheet(wb, wsDepts, 'Departamentos_Validos');

    // 4. Descargamos el archivo
    XLSX.writeFile(wb, 'Plantilla_Importacion_Trabajadores.xlsx');
  }

  getDepartmentNames(departments: any[] | null | undefined): string {
  if (!departments || !Array.isArray(departments) || departments.length === 0) {
    return 'Sin Departamento';
  }
  // Aquí sí puedes usar .map y .join sin problemas
  return departments.map(d => d.name).join(', ');
}
}
