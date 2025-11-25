# Shared Module

Questa cartella contiene codice riutilizzabile all'interno del progetto.

## 📂 Struttura

```
shared/
├── components/     # Componenti UI riutilizzabili (buttons, modals, cards, etc.)
├── services/       # Servizi comuni (API, storage, notification, etc.)
├── pipes/          # Pipes custom (date format, currency, text transform, etc.)
├── directives/     # Direttive custom (permissions, tooltips, etc.)
├── models/         # TypeScript interfaces e types
├── guards/         # Route guards (auth, role-based, etc.)
├── interceptors/   # HTTP interceptors (auth token, error handling, loading)
├── utils/          # Funzioni utility (validators, helpers, constants)
└── README.md
```

## 🎯 Quando Usare Shared

### ✅ Usa shared/ per:
- Componenti usati in più di 2+ pagine
- Servizi che gestiscono logica comune
- Pipes/Directives riutilizzabili
- Models condivisi tra feature modules
- Guards e Interceptors

### ❌ NON usare shared/ per:
- Componenti specifici di una sola feature
- Logica business specifica di un modulo
- Componenti usati una sola volta

## 📝 Esempi

### Components
```typescript
// shared/components/button/button.component.ts
@Component({
  selector: 'app-button',
  template: `<button [class]="buttonClass">{{ label }}</button>`,
  standalone: true
})
export class ButtonComponent {
  @Input() label = '';
  @Input() variant: 'primary' | 'secondary' = 'primary';
}
```

### Services
```typescript
// shared/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}/${endpoint}`);
  }
}
```

### Pipes
```typescript
// shared/pipes/truncate.pipe.ts
@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}
```

### Guards
```typescript
// shared/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};
```

### Interceptors
```typescript
// shared/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

## 🔗 Import Pattern

```typescript
// In component/service
import { ButtonComponent } from '@shared/components/button/button.component';
import { ApiService } from '@shared/services/api.service';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
```

## 📚 Best Practices

1. **Standalone Components**: Usa sempre standalone components (Angular 19+)
2. **Naming Convention**: `feature.type.ts` (es: `auth.guard.ts`, `api.service.ts`)
3. **One Responsibility**: Ogni file ha una sola responsabilità
4. **Documentation**: Commenta interfacce e funzioni pubbliche
5. **Testing**: Ogni shared component/service deve avere test

## 🚀 Quick Start

### Creare un nuovo componente shared
```bash
ng generate component shared/components/loading --project=cicd-test --standalone
```

### Creare un nuovo servizio shared
```bash
ng generate service shared/services/notification --project=cicd-test
```

### Creare una nuova pipe shared
```bash
ng generate pipe shared/pipes/safe-html --project=cicd-test --standalone
```

### Creare un nuovo guard
```bash
ng generate guard shared/guards/admin --project=cicd-test --functional
```
