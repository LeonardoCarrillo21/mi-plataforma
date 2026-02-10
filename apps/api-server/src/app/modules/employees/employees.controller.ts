import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateWorkerDto, WorkerPublicDto } from '@mi-plataforma/shared-utils';

@Controller('employees') // Esta es la ruta base: /api/employees
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async getAll() {
    return await this.employeesService.findAll();
  }
  @Post('register-worker')
  async create(@Body() dto: CreateWorkerDto) {
    return await this.employeesService.create(dto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.employeesService.delete(id);
  }
  @Get('departments')
  async getDepartments() {
    return await this.employeesService.findAllDepartments();
  }
  @Patch(':id') // Usamos Patch para actualizaciones parciales
  async update(@Param('id') id: string, @Body() dto: CreateWorkerDto) {
    return await this.employeesService.update(id, dto);
  }
  @Post('bulk')
  async bulkCreate(@Body() dtos: CreateWorkerDto[]) {
    return await this.employeesService.bulkCreate(dtos);
  }
  // @Get('public')
  // async getPublicWorkers(): Promise<WorkerPublicDto[]> {
  //   const workers = await this.employeesService.findAll();

  //   // Transformamos el Worker real al DTO seguro
  //   return workers.map((w) => ({
  //     id: w.id,
  //     name: w.name,
  //     role: w.role || 'Empleado',
  //     departments: w.departments?.map((d) => d.name) || [],
  //   }));
  // }
}
