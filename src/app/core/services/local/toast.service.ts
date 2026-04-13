import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(private toastCtrl: ToastController) {}

  async success(message: string): Promise<void> {
    await this.show(message, 'success');
  }

  async error(message: string): Promise<void> {
    await this.show(message, 'danger');
  }

  async warning(message: string): Promise<void> {
    await this.show(message, 'warning');
  }

  async info(message: string): Promise<void> {
    await this.show(message, 'primary');
  }

  private async show(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }
}
