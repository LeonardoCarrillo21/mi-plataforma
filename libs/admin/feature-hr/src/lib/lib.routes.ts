// libs/admin/feature-hr/src/index.ts
import { Route } from '@angular/router';
import { ManageWorkers } from './manage-workers/manage-workers';

export const hrRoutes: Route[] = [
  { path: '', component: ManageWorkers }
];