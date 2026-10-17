// ============================================================
// core/layout/confirm-modal/confirm-modal.ts
// Dibuja el modal de confirmación cuando hay una pendiente en ConfirmService
// ============================================================

import { Component, inject } from '@angular/core';
import { Confirm } from '@core/services/confirm';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  confirmacion = inject(Confirm);
}