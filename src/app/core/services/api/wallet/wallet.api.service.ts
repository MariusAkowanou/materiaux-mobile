import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WalletBalance, WithdrawalRequest, WithdrawalCreate } from './wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly url = `${environment.apiUrl}/wallet`;

  constructor(private http: HttpClient) {}

  getBalance(): Observable<WalletBalance> {
    return this.http.get<WalletBalance>(`${this.url}/balance`);
  }

  getWithdrawals(): Observable<WithdrawalRequest[]> {
    return this.http.get<WithdrawalRequest[]>(`${this.url}/withdrawals`);
  }

  createWithdrawal(dto: WithdrawalCreate): Observable<WithdrawalRequest> {
    return this.http.post<WithdrawalRequest>(`${this.url}/withdrawals`, dto);
  }
}
