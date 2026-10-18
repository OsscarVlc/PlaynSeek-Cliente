import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ChatDemo,
  USUARIO_CHAT_DEMO_ID,
} from '../services/chat-demo';

@Component({
  selector: 'app-chat-privado',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './chat-privado.html',
  styleUrl: './chat-privado.scss',
})
export class ChatPrivado {
  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatDemo);

  private readonly parametros = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly usuarioActualId = USUARIO_CHAT_DEMO_ID;
  readonly busqueda = signal('');

  // Cada conversación conserva su propio borrador.
  borradores: Record<string, string> = {};

  readonly usuarioSeleccionadoId = computed(
    () => this.parametros().get('id'),
  );

  readonly conversacion = computed(() =>
    this.chatService.conversaciones().find(
      (conversacion) =>
        conversacion.usuarioId === this.usuarioSeleccionadoId(),
    ),
  );

  readonly conversacionesVisibles = computed(() => {
    const texto = this.normalizar(this.busqueda());

    return this.chatService.conversaciones().filter((conversacion) =>
      this.normalizar(`${conversacion.nombre} ${conversacion.juego}`)
        .includes(texto),
    );
  });

  enviar(): void {
    const conversacion = this.conversacion();
    if (!conversacion) return;

    const texto = (this.borradores[conversacion.usuarioId] ?? '').trim();
    if (!texto || texto.length > 1000) return;

    this.chatService.enviar(conversacion.usuarioId, texto);
    this.borradores[conversacion.usuarioId] = '';
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}