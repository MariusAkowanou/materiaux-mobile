import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthStore } from '../../core/services/api/auth/auth.store';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent],
  templateUrl: './splash.page.html',
})
export class SplashPage implements OnInit {
  private router    = inject(Router);
  private authStore = inject(AuthStore);

  /** Durée minimale d'affichage du splash (ms) */
  private readonly SPLASH_DURATION = 500;

  async ngOnInit(): Promise<void> {
    console.log('[SplashPage] Initializing...');
    
    // On attend la durée minimale
    await this.delay(this.SPLASH_DURATION);
    
    console.log('[SplashPage] Attempting navigation to /dashboard...');
    
    try {
      // On tente d'aller au dashboard avec un timeout de sécurité
      const navPromise = this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      
      // Si la navigation prend plus de 5 secondes, on force une redirection vers login
      const timeoutPromise = new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('Navigation timeout')), 5000)
      );

      await Promise.race([navPromise, timeoutPromise]);
      console.log('[SplashPage] Navigation successful or redirected by guards.');
    } catch (error) {
      console.error('[SplashPage] Navigation failed or timed out:', error);
      // Fallback vers le login en cas de problème majeur
      await this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
