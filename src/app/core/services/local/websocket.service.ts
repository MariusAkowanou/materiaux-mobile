import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

export interface WsMessage {
  type: string;
  payload: any;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {

  readonly messages = signal<WsMessage[]>([]);

  private socket: WebSocket | null = null;
  private token: string | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

  connect(token: string): void {
    this.token = token;
    this.intentionalDisconnect = false;
    this.openSocket();
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearReconnectTimeout();
    this.socket?.close();
    this.socket = null;
  }

  private openSocket(): void {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(`${environment.wsUrl}?token=${this.token}`);

    this.socket.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        this.messages.update((prev) => [...prev, msg]);
      } catch {
        // Message non JSON ignoré
      }
    };

    this.socket.onclose = () => {
      if (!this.intentionalDisconnect) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      if (!this.intentionalDisconnect && this.token) {
        this.openSocket();
      }
    }, 3000);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
