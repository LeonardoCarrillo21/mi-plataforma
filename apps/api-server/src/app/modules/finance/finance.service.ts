import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RowWorker_Departments } from '@mi-plataforma/shared-utils';
@Injectable()
export class FinanceService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env['SUPABASE_URL'] || '',
      process.env['SUPABASE_KEY'] || '',
    );
  }

  async getDepartmentStats() {
    const { data, error } = await this.supabase.from('worker_departments')
      .select(`
      workers (
        salary
      ),
      departments (
        name
      )
    `);

    if (error) throw new Error(error.message);

    const rows = data as unknown as RowWorker_Departments[];

    const stats = rows.reduce<Record<string, number>>((acc, row) => {
      const deptName = row.departments?.name ?? 'Sin Departamento';
      const salary = row.workers?.salary ?? 0;

      acc[deptName] = (acc[deptName] || 0) + salary;
      return acc;
    }, {});

    return Object.entries(stats).map(([name, totalSalary]) => ({
      name,
      totalSalary,
    }));
  }
}
