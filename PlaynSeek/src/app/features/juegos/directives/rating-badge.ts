import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appRatingBadge]',
})
export class RatingBadge {
  @Input('appRatingBadge') rating = 0;

  @HostBinding('style.borderColor')
  get colorBorde(): string {
    if (this.rating >= 4.6) {
      return 'rgba(188, 255, 98, 0.55)';
    }
    if (this.rating >= 4.3) {
      return 'rgba(164, 154, 255, 0.55)';
    }
    return 'var(--pns-color-borde)';
  }

  @HostBinding('style.color')
  get colorTexto(): string {
    if (this.rating >= 4.6) {
      return 'var(--pns-color-primario)';
    }
    return 'var(--pns-color-texto)';
  }
}
