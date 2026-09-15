import { trigger, state, style, animate, transition } from '@angular/animations';

export const sidebarAnimations = {
  open: trigger('open', [
    state('open', style({ transform: 'translateX(0)' })),
    state('closed', style({ transform: 'translateX(-100%)' })),
    transition('open <=> closed', animate('250ms ease-in-out'))
  ])
};
