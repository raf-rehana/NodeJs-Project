import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLog } from '../../core/services/audit-log.service';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.html'
})
export class AdminAuditLogsComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);

  public logs = signal<AuditLog[]>([]);

  ngOnInit() {
    this.auditLogService.getLogs().subscribe(data => this.logs.set(data));
  }
}
