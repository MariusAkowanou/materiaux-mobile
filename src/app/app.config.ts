import { ApplicationConfig, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { GoogleMapsLoaderService } from './core/services/local/google-maps-loader.service';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular({ mode: 'ios' }),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'fr' },
    {
      provide: APP_INITIALIZER,
      useFactory: (loader: GoogleMapsLoaderService) => () => loader.load(),
      deps: [GoogleMapsLoaderService],
      multi: true,
    },
  ],
};
