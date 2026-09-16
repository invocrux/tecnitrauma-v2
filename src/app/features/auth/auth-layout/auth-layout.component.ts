import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, LottieComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  loginAnimationOptions: AnimationOptions = {
    path: '/assets/login-animation.json'
  };
}
