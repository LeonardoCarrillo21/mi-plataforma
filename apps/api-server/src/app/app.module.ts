import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importa esto
import { EmployeesModule } from './modules/employees/employees.module';
import { FinanceModule } from './modules/finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Esto carga el archivo .env
    EmployeesModule,
    FinanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
