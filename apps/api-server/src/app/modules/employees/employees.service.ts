import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateWorkerDto, Worker } from '@mi-plataforma/shared-utils';

@Injectable()
export class EmployeesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env['SUPABASE_URL'] || '',
      process.env['SUPABASE_KEY'] || '',
    );
  }
  
  async findAll() {
    const { data, error } = await this.supabase
      .from('workers')
      .select(
        `
        id,
        name,
        email,
        salary,
        role,
        created_at,
        worker_departments (
          departments (
            id,
            name
          )
        )
      `,
      )
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // console.log('Fetched workers:', data);

    // const rows = data as unknown as Worker[];

    return data.map((row) => {
      const departmentsList = (row.worker_departments || [])
        .map((wd) => wd.departments)
        .filter((dept) => !!dept); // Elimina valores nulos si la relación está rota
      // console.log('Worker Departments:', departmentsList);
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        salary: row.salary,
        role: row.role,
        created_at: row.created_at,
        departments: departmentsList,
      };
    });
  }

  async create(dto: CreateWorkerDto) {
    const { data: worker, error: wError } = await this.supabase
      .from('workers')
      .insert([
        {
          name: dto.name,
          email: dto.email,
          salary: dto.salary,
        },
      ])
      .select()
      .single();

    if (wError) throw new Error(wError.message);

    // 2. Crear las relaciones en la tabla intermedia
    if (dto.department_ids?.length > 0) {
      const relations = dto.department_ids.map((deptId) => ({
        worker_id: worker.id,
        department_id: deptId,
      }));

      const { error: relError } = await this.supabase
        .from('worker_departments')
        .insert(relations)
        .select();

      if (relError) throw new Error(relError.message);
    }

    return worker;
  }

  async update(id: string, dto: CreateWorkerDto) {
    // 1️⃣ Actualizar datos base del worker
    const { data: worker, error: wError } = await this.supabase
      .from('workers')
      .update({
        name: dto.name,
        email: dto.email,
        salary: dto.salary,
      })
      .eq('id', id)
      .select()
      .single();

    if (wError) throw new Error(wError.message);

    // 2️⃣ Sincronizar departamentos (tabla pivote)
    if (dto.department_ids) {
      // borrar relaciones actuales
      const { error: delError } = await this.supabase
        .from('worker_departments')
        .delete()
        .eq('worker_id', id);

      if (delError) throw new Error(delError.message);

      // insertar nuevas relaciones
      if (dto.department_ids.length > 0) {
        const relations = dto.department_ids.map((deptId) => ({
          worker_id: id,
          department_id: deptId,
        }));

        const { data: insData, error: insError } = await this.supabase
          .from('worker_departments')
          .insert(relations);

        // console.log('Inserted relations:', insData);
        if (insError) throw new Error(insError.message);
      }
    }

    return worker;
  }

  async delete(id: string) {
    // borrar relaciones
    await this.supabase.from('worker_departments').delete().eq('worker_id', id);

    // borrar worker
    const { error } = await this.supabase.from('workers').delete().eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }

  async findAllDepartments() {
    const { data, error } = await this.supabase
      .from('departments')
      .select('id, name, budget');

    if (error) throw new Error(error.message);
    return data;
  }
  async bulkCreate(dtos: CreateWorkerDto[]) {
    // 1️⃣ Insertar workers
    const workersPayload = dtos.map((dto) => ({
      name: dto.name,
      email: dto.email,
      salary: dto.salary,
    }));

    const { data: workers, error } = await this.supabase
      .from('workers')
      .insert(workersPayload)
      .select();

    if (error) throw new Error(error.message);

    // 2️⃣ Insertar relaciones
    const relations = workers.flatMap((worker, index) =>
      (dtos[index].department_ids ?? []).map((deptId) => ({
        worker_id: worker.id,
        department_id: deptId,
      })),
    );

    if (relations.length > 0) {
      const { error: relError } = await this.supabase
        .from('worker_departments')
        .insert(relations);

      if (relError) throw new Error(relError.message);
    }

    return workers;
  }
}
