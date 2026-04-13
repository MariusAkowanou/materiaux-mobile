import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="false" class="[--background:transparent]">
      <!-- Racine du Splash avec gradient et motifs -->
      <div class="relative w-full h-full flex flex-col items-center justify-center overflow-hidden
                  bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,#F4A068_0%,#E07B39_45%,#C46B2D_100%)]
                  before:content-[''] before:absolute before:inset-0 before:pointer-events-none
                  before:bg-[repeating-linear-gradient(-45deg,transparent,transparent_28px,rgba(255,255,255,0.04)_28px,rgba(255,255,255,0.04)_30px)]
                  after:content-[''] after:absolute after:bottom-[-80px] after:left-1/2 after:-translate-x-1/2 after:pointer-events-none
                  after:w-[320px] after:h-[320px] after:bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,transparent_70%)]">

        <!-- Anneaux pulsants -->
        <div class="absolute w-[160px] h-[160px] rounded-full border-2 border-white/20 animate-pulse-ring [animation-delay:400ms]"></div>
        <div class="absolute w-[120px] h-[120px] rounded-full border-2 border-white/50 animate-pulse-ring"></div>

        <!-- Icône centrale -->
        <div class="relative flex items-center justify-center mb-10 animate-fade-in">
          <div class="w-24 h-24 rounded-[28px] bg-white/18 backdrop-blur-md border-[1.5px] border-white/35 
                      flex items-center justify-center 
                      shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <i class="pi pi-building text-[48px] text-white leading-none"></i>
          </div>
        </div>

        <!-- Texte de marque -->
        <div class="flex flex-col items-center gap-2.5 animate-slide-up [animation-delay:200ms]">
          <div class="text-[26px] font-extrabold tracking-wider text-white uppercase [text-shadow:0_2px_12px_rgba(0,0,0,0.2)] leading-[1.1] text-center">
            Matériaux<br /><span class="text-white/75 font-normal text-[22px]">Express</span>
          </div>
          <div class="w-10 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-[1px]"></div>
          <p class="text-[13px] font-normal tracking-[0.06em] uppercase text-white/65 text-center leading-relaxed max-w-[220px]">
            La plateforme B2B du BTP au Bénin
          </p>
        </div>

        <!-- Loader en bas -->
        <div class="absolute bottom-16 left-1/2 -translate-x-1/2 animate-slide-up [animation-delay:500ms] flex flex-col items-center gap-3">
          <i class="pi pi-spinner text-[22px] text-white/70 animate-breathe-spin"></i>
          <div class="flex gap-1.5">
            <span class="w-1.25 h-1.25 rounded-full bg-white/50 animate-dot-pulse"></span>
            <span class="w-1.25 h-1.25 rounded-full bg-white/50 animate-dot-pulse [animation-delay:200ms]"></span>
            <span class="w-1.25 h-1.25 rounded-full bg-white/50 animate-dot-pulse [animation-delay:400ms]"></span>
          </div>
        </div>

      </div>
    </ion-content>
  `,
})
export class SplashPage {}
