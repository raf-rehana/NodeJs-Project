import { Routes } from '@angular/router';
import { SummaryComponent } from './summary/summary';
import { MyTasksComponent } from './my-tasks/my-tasks';
import { TaskDetail } from './task-detail/task-detail';
import { EmployeeKnowledgeBaseComponent } from './knowledge-base/knowledge-base';
import { NotificationsComponent } from '../client/notifications/notifications';

export const EMPLOYEE_ROUTES: Routes = [
  { path: 'summary', component: SummaryComponent },
  { path: 'my-tasks', component: MyTasksComponent },
  { path: 'task-detail/:id', component: TaskDetail },
  { path: 'knowledge-base', component: EmployeeKnowledgeBaseComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: '', redirectTo: 'summary', pathMatch: 'full' }
];
