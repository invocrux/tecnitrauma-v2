import { trigger, state, style, animate, transition } from '@angular/animations';

export const modalAnimations = {
  fadeIn: trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('200ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('150ms ease-in', style({ opacity: 0 }))
    ])
  ]),
  scaleIn: trigger('scaleIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.95)' }),
      animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ]),
    transition(':leave', [
      animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
    ])
  ])
};
