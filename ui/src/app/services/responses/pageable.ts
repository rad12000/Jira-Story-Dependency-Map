import { Observable } from 'rxjs';

export interface Pageable<T> {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: T[];
  next?: () => Observable<Pageable<T>>;
}
