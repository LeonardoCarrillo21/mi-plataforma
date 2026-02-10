// libs/shared-utils/src/lib/worker.interface.ts
export interface Department {
  id: string;
  name: string;
  budget: number;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  salary: number;
  role?: string; 
// Un trabajador puede pertenecer a múltiples departamentos
  departments?: Department[]; // Objeto completo (opcional para cuando hagamos JOINs)
  created_at?: Date;
}

export interface CreateWorkerDto {
  name: string;
  email: string;
  salary: number;
  department_ids: string[] | null; // Array de UUIDs seleccionados en el multiselect
}

// 3. DTO para Vista de Usuario (Seguridad)
// Omitimos el salario o datos sensibles si el rol no es admin
export interface WorkerPublicDto {
  id: string;
  name: string;
  role: string;
  departments: string[]; // Solo los nombres de los departamentos
}

// Estructura de lo que viene de Supabase
// export interface WorkerRow {
//   salary: number | string;
//   departments: { name: string } | { name: string }[] | null;
// }
export type RowWorker_Departments= { //recibe cada fila de la tabla worker_departments
  workers: { salary: number } | null;
  departments: { name: string } | null;
};

// Estructura del acumulador (un objeto donde la llave es el nombre y el valor el total)
export interface SalaryAccumulator {//interface para el acumulador de salarios por departamento (graficas en dashboard)
  [deptName: string]: number;
}
