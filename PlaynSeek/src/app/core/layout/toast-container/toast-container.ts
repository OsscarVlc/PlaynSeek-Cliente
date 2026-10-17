// ============================================================
// core/layout/toast-container/toast-container.ts
// Dibuja los avisos que hay en NotificationService
// ============================================================

import { Component, inject } from '@angular/core';

import { Notification } from '@core/services/notification';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  notificacion = inject(Notification);
}