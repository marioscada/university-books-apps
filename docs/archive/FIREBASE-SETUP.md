# 🔥 Firebase Integration Guide

Guida completa per integrare Firebase nel progetto Angular monorepo con configurazioni personalizzabili per cliente.

## 📋 Indice

- [Overview](#overview)
- [Setup Iniziale](#setup-iniziale)
- [Installazione Pacchetti](#installazione-pacchetti)
- [Configurazione Firebase Console](#configurazione-firebase-console)
- [Configurazione Progetto](#configurazione-progetto)
- [Servizi Firebase](#servizi-firebase)
- [Security Rules](#security-rules)
- [Deployment](#deployment)
- [Testing](#testing)

---

## 🎯 Overview

Firebase fornisce:
- **Authentication** - Login con email, Google, Facebook, etc.
- **Firestore** - Database NoSQL in real-time
- **Storage** - Upload e gestione file
- **Hosting** - Deploy statico
- **Cloud Functions** - Backend serverless
- **Analytics** - Tracciamento eventi
- **Cloud Messaging** - Push notifications

---

## 🚀 Setup Iniziale

### 1. Crea Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca "Add project"
3. Inserisci nome progetto (es. "acme-production")
4. Abilita Google Analytics (opzionale)
5. Crea progetto

### 2. Aggiungi App Web

1. Nel progetto Firebase, clicca sull'icona Web (`</>`)
2. Registra app con nome (es. "Acme Web App")
3. Copia le credenziali Firebase Config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

### 3. Abilita Servizi

**Authentication:**
- Build → Authentication → Get Started
- Abilita provider: Email/Password, Google, etc.

**Firestore:**
- Build → Firestore Database → Create database
- Scegli location (es. europe-west1)
- Start in production mode (poi aggiungi rules)

**Storage:**
- Build → Storage → Get Started
- Usa default security rules (poi personalizza)

---

## 📦 Installazione Pacchetti

```bash
# Angular Fire (SDK ufficiale)
npm install @angular/fire firebase

# Optional: Firebase Admin SDK (per Cloud Functions)
npm install firebase-admin

# Optional: Firebase Tools CLI
npm install -g firebase-tools
```

---

## ⚙️ Configurazione Progetto

### 1. Aggiorna `project.config.js`

Aggiungi sezione Firebase:

```javascript
// project.config.js
module.exports = {
  client: {
    name: 'Acme Corp',
    // ... altre config
  },

  // ✅ NUOVA SEZIONE FIREBASE
  firebase: {
    // Development environment
    development: {
      apiKey: process.env['FIREBASE_DEV_API_KEY'] || 'YOUR_DEV_API_KEY',
      authDomain: 'acme-dev.firebaseapp.com',
      projectId: 'acme-dev',
      storageBucket: 'acme-dev.appspot.com',
      messagingSenderId: '123456789012',
      appId: '1:123456789012:web:dev123',
      measurementId: 'G-DEVXXXXXX'
    },

    // Production environment
    production: {
      apiKey: process.env['FIREBASE_PROD_API_KEY'] || 'YOUR_PROD_API_KEY',
      authDomain: 'acme-prod.firebaseapp.com',
      projectId: 'acme-prod',
      storageBucket: 'acme-prod.appspot.com',
      messagingSenderId: '987654321098',
      appId: '1:987654321098:web:prod456',
      measurementId: 'G-PRODXXXXXX'
    },

    // Features da abilitare
    features: {
      auth: true,
      firestore: true,
      storage: true,
      analytics: true,
      messaging: false,
      functions: false
    }
  },

  // ... resto della config
};
```

### 2. Aggiorna Environment Files

**`projects/cicd-test/src/environments/environment.ts`** (Development):

```typescript
export const environment = {
  production: false,
  appName: 'CICD Test',
  apiUrl: 'http://localhost:3000/api',
  enableDebug: true,
  version: '1.0.0',

  // Firebase Configuration
  firebase: {
    apiKey: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    authDomain: 'your-project-dev.firebaseapp.com',
    projectId: 'your-project-dev',
    storageBucket: 'your-project-dev.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:dev123',
    measurementId: 'G-DEVXXXXXX'
  },

  // Firebase Features
  firebaseFeatures: {
    auth: true,
    firestore: true,
    storage: true,
    analytics: true,
    messaging: false
  }
};
```

**`projects/cicd-test/src/environments/environment.prod.ts`** (Production):

```typescript
export const environment = {
  production: true,
  appName: 'CICD Test',
  apiUrl: 'https://api.example.com',
  enableDebug: false,
  version: '1.0.0',

  // Firebase Configuration
  firebase: {
    apiKey: 'AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY',
    authDomain: 'your-project-prod.firebaseapp.com',
    projectId: 'your-project-prod',
    storageBucket: 'your-project-prod.appspot.com',
    messagingSenderId: '987654321098',
    appId: '1:987654321098:web:prod456',
    measurementId: 'G-PRODXXXXXX'
  },

  // Firebase Features
  firebaseFeatures: {
    auth: true,
    firestore: true,
    storage: true,
    analytics: true,
    messaging: true
  }
};
```

### 3. Configura App Module

**`projects/cicd-test/src/app/app.config.ts`**:

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideAnalytics, getAnalytics, ScreenTrackingService } from '@angular/fire/analytics';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // Firebase Core
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Firebase Authentication (se abilitato)
    ...(environment.firebaseFeatures.auth
      ? [provideAuth(() => getAuth())]
      : []
    ),

    // Firestore Database (se abilitato)
    ...(environment.firebaseFeatures.firestore
      ? [provideFirestore(() => getFirestore())]
      : []
    ),

    // Firebase Storage (se abilitato)
    ...(environment.firebaseFeatures.storage
      ? [provideStorage(() => getStorage())]
      : []
    ),

    // Analytics (se abilitato)
    ...(environment.firebaseFeatures.analytics && environment.production
      ? [
          provideAnalytics(() => getAnalytics()),
          ScreenTrackingService
        ]
      : []
    ),

    // Cloud Functions (se abilitato)
    ...(environment.firebaseFeatures.functions
      ? [provideFunctions(() => getFunctions())]
      : []
    ),

    // Cloud Messaging (se abilitato)
    ...(environment.firebaseFeatures.messaging
      ? [provideMessaging(() => getMessaging())]
      : []
    ),
  ]
};
```

### 4. Aggiorna Script di Configurazione

**`scripts/configure-project.js`** - Aggiungi sezione per Firebase:

```javascript
// ... codice esistente ...

// =============================================================================
// 7. Update Firebase Configuration in Environment Files
// =============================================================================

console.log('7️⃣  Updating Firebase configuration...');

config.projects.forEach(project => {
  // Development environment
  const envDevPath = path.join(__dirname, `../projects/${project.name}/src/environments/environment.ts`);
  if (fs.existsSync(envDevPath)) {
    let envDev = readFile(envDevPath);

    // Replace Firebase config
    const firebaseDev = JSON.stringify(config.firebase.development, null, 4);
    envDev = envDev.replace(
      /firebase:\s*\{[^}]*\}/s,
      `firebase: ${firebaseDev.replace(/"/g, "'")}`
    );

    // Replace features
    const featuresDev = JSON.stringify(config.firebase.features, null, 4);
    envDev = envDev.replace(
      /firebaseFeatures:\s*\{[^}]*\}/s,
      `firebaseFeatures: ${featuresDev}`
    );

    writeFile(envDevPath, envDev);
    console.log(`   ✅ Updated Firebase config: ${envDevPath}`);
  }

  // Production environment
  const envProdPath = path.join(__dirname, `../projects/${project.name}/src/environments/environment.prod.ts`);
  if (fs.existsSync(envProdPath)) {
    let envProd = readFile(envProdPath);

    // Replace Firebase config
    const firebaseProd = JSON.stringify(config.firebase.production, null, 4);
    envProd = envProd.replace(
      /firebase:\s*\{[^}]*\}/s,
      `firebase: ${firebaseProd.replace(/"/g, "'")}`
    );

    // Replace features
    const featuresProd = JSON.stringify(config.firebase.features, null, 4);
    envProd = envProd.replace(
      /firebaseFeatures:\s*\{[^}]*\}/s,
      `firebaseFeatures: ${featuresProd}`
    );

    writeFile(envProdPath, envProd);
    console.log(`   ✅ Updated Firebase config: ${envProdPath}`);
  }
});
```

---

## 🔧 Servizi Firebase

### 1. Authentication Service

**`projects/cicd-test/src/shared/services/auth.service.ts`**:

```typescript
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  user
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Observable dell'utente corrente
  user$: Observable<User | null> = user(this.auth);

  /**
   * Login con email e password
   */
  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Registrazione con email e password
   */
  async registerWithEmail(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error: any) {
      throw new Error(this.handleError(error));
    }
  }

  /**
   * Ottieni utente corrente
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Ottieni token ID
   */
  async getIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    return user ? await user.getIdToken() : null;
  }

  /**
   * Check se utente è autenticato
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Gestione errori
   */
  private handleError(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Utente non trovato';
      case 'auth/wrong-password':
        return 'Password errata';
      case 'auth/email-already-in-use':
        return 'Email già registrata';
      case 'auth/weak-password':
        return 'Password troppo debole';
      case 'auth/invalid-email':
        return 'Email non valida';
      default:
        return error.message || 'Errore sconosciuto';
    }
  }
}
```

### 2. Firestore Service

**`projects/cicd-test/src/shared/services/firestore.service.ts`**:

```typescript
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  DocumentData,
  QueryConstraint
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData, docData } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  /**
   * Crea documento con ID auto-generato
   */
  async create<T>(collectionPath: string, data: T): Promise<string> {
    const collectionRef = collection(this.firestore, collectionPath);
    const docRef = await addDoc(collectionRef, data as any);
    return docRef.id;
  }

  /**
   * Crea o aggiorna documento con ID specifico
   */
  async set<T>(collectionPath: string, docId: string, data: T): Promise<void> {
    const docRef = doc(this.firestore, collectionPath, docId);
    await setDoc(docRef, data as any);
  }

  /**
   * Leggi documento per ID
   */
  async get<T>(collectionPath: string, docId: string): Promise<T | null> {
    const docRef = doc(this.firestore, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  }

  /**
   * Stream documento (real-time)
   */
  getStream<T>(collectionPath: string, docId: string): Observable<T | undefined> {
    const docRef = doc(this.firestore, collectionPath, docId);
    return docData(docRef) as Observable<T>;
  }

  /**
   * Aggiorna documento
   */
  async update<T>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
    const docRef = doc(this.firestore, collectionPath, docId);
    await updateDoc(docRef, data as any);
  }

  /**
   * Elimina documento
   */
  async delete(collectionPath: string, docId: string): Promise<void> {
    const docRef = doc(this.firestore, collectionPath, docId);
    await deleteDoc(docRef);
  }

  /**
   * Query collection con filtri
   */
  async query<T>(
    collectionPath: string,
    ...queryConstraints: QueryConstraint[]
  ): Promise<T[]> {
    const collectionRef = collection(this.firestore, collectionPath);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  /**
   * Stream collection (real-time)
   */
  queryStream<T>(
    collectionPath: string,
    ...queryConstraints: QueryConstraint[]
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionPath);
    const q = query(collectionRef, ...queryConstraints);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Ottieni tutti i documenti di una collection
   */
  async getAll<T>(collectionPath: string): Promise<T[]> {
    return this.query<T>(collectionPath);
  }

  /**
   * Stream collection completa (real-time)
   */
  getAllStream<T>(collectionPath: string): Observable<T[]> {
    return this.queryStream<T>(collectionPath);
  }
}
```

**Esempio di utilizzo:**

```typescript
// Component
export class UsersComponent {
  private firestoreService = inject(FirestoreService);
  users$ = this.firestoreService.queryStream<User>(
    'users',
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  async createUser(user: User) {
    await this.firestoreService.create('users', user);
  }

  async updateUser(userId: string, data: Partial<User>) {
    await this.firestoreService.update('users', userId, data);
  }

  async deleteUser(userId: string) {
    await this.firestoreService.delete('users', userId);
  }
}
```

### 3. Storage Service

**`projects/cicd-test/src/shared/services/storage.service.ts`**:

```typescript
import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { percentage } from 'rxfire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  /**
   * Upload file
   */
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  /**
   * Upload file con progress
   */
  uploadFileWithProgress(path: string, file: File): {
    task: UploadTask;
    progress$: Observable<number | undefined>;
  } {
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);
    const progress$ = percentage(task);

    return { task, progress$ };
  }

  /**
   * Ottieni download URL
   */
  async getDownloadURL(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    return await getDownloadURL(storageRef);
  }

  /**
   * Elimina file
   */
  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  /**
   * Lista tutti i file in una cartella
   */
  async listFiles(path: string): Promise<string[]> {
    const storageRef = ref(this.storage, path);
    const result = await listAll(storageRef);
    return Promise.all(
      result.items.map(item => getDownloadURL(item))
    );
  }
}
```

**Esempio upload con progress:**

```typescript
// Component
uploadImage(file: File) {
  const path = `images/${Date.now()}_${file.name}`;
  const { task, progress$ } = this.storageService.uploadFileWithProgress(path, file);

  // Mostra progress
  progress$.subscribe(progress => {
    console.log(`Upload: ${progress}%`);
  });

  // Aspetta completamento
  task.then(async () => {
    const downloadURL = await this.storageService.getDownloadURL(path);
    console.log('File disponibile a:', downloadURL);
  });
}
```

### 4. Auth Guard

**`projects/cicd-test/src/shared/guards/auth.guard.ts`**:

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect a login con return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

**Uso nelle routes:**

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]  // ← Proteggi route
  }
];
```

### 5. Auth Interceptor

**`projects/cicd-test/src/shared/interceptors/firebase-auth.interceptor.ts`**:

```typescript
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const firebaseAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Aggiungi token Firebase alle richieste API
  return from(authService.getIdToken()).pipe(
    switchMap(token => {
      if (token && req.url.includes('/api/')) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      return next(req);
    })
  );
};
```

**Register in app.config.ts:**

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firebaseAuthInterceptor } from './shared/interceptors/firebase-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([firebaseAuthInterceptor])
    )
  ]
};
```

---

## 🔒 Security Rules

### Firestore Rules

**`firestore.rules`**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Tutti possono leggere profili pubblici
      allow read: if isSignedIn();

      // Solo l'owner può scrivere il proprio profilo
      allow write: if isOwner(userId);
    }

    // Posts collection
    match /posts/{postId} {
      // Tutti possono leggere
      allow read: if true;

      // Solo utenti autenticati possono creare
      allow create: if isSignedIn();

      // Solo l'autore può modificare/eliminare
      allow update, delete: if isSignedIn() &&
        request.auth.uid == resource.data.authorId;
    }

    // Private user data
    match /users/{userId}/private/{document=**} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

### Storage Rules

**`storage.rules`**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }

    function isSizeValid() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB
    }

    // User profile images
    match /users/{userId}/avatar/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId) && isImage() && isSizeValid();
    }

    // Public images
    match /images/{fileName} {
      allow read: if true;
      allow write: if isSignedIn() && isImage() && isSizeValid();
    }

    // Private user files
    match /users/{userId}/private/{allPaths=**} {
      allow read, write: if isOwner(userId) && isSizeValid();
    }
  }
}
```

---

## 🚀 Deployment

### 1. Installa Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Inizializza Firebase nel Progetto

```bash
firebase init

# Seleziona:
# - Firestore
# - Storage
# - Hosting (opzionale)
# - Functions (opzionale)

# Scegli progetto esistente
# Accetta default per rules files
```

### 3. Deploy Security Rules

```bash
# Deploy solo Firestore rules
firebase deploy --only firestore:rules

# Deploy solo Storage rules
firebase deploy --only storage:rules

# Deploy tutto
firebase deploy
```

### 4. Deploy Hosting (Opzionale)

**`firebase.json`**:

```json
{
  "hosting": {
    "public": "dist/cicd-test/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

**Deploy:**

```bash
# Build Angular app
npm run build:cicd-test

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 🧪 Testing

### Emulatori Firebase (Local Development)

```bash
# Installa emulatori
firebase init emulators

# Avvia emulatori
firebase emulators:start

# Emulatori disponibili su:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Storage: http://localhost:9199
# - Functions: http://localhost:5001
```

**Usa emulatori in development:**

```typescript
// environment.ts
export const environment = {
  production: false,
  useEmulators: true,
  // ...
};

// app.config.ts
import { connectAuthEmulator } from '@angular/fire/auth';
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { connectStorageEmulator } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebase);

      if (environment.useEmulators) {
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const storage = getStorage(app);

        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
      }

      return app;
    })
  ]
};
```

---

## 🔐 Gestione Secrets

### Variabili d'Ambiente (.env)

**`.env.development`** (NON committare):

```bash
FIREBASE_DEV_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_DEV_AUTH_DOMAIN=your-project-dev.firebaseapp.com
FIREBASE_DEV_PROJECT_ID=your-project-dev
```

**`.env.production`** (NON committare):

```bash
FIREBASE_PROD_API_KEY=AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
FIREBASE_PROD_AUTH_DOMAIN=your-project-prod.firebaseapp.com
FIREBASE_PROD_PROJECT_ID=your-project-prod
```

### GitHub Secrets

Per CI/CD, aggiungi secrets su GitHub:

```
Settings → Secrets → Actions → New repository secret

FIREBASE_DEV_CONFIG={...json config...}
FIREBASE_PROD_CONFIG={...json config...}
```

### Usa in GitHub Actions

```yaml
# .github/workflows/deploy.yaml
- name: Deploy to Firebase
  env:
    FIREBASE_CONFIG: ${{ secrets.FIREBASE_PROD_CONFIG }}
  run: |
    echo $FIREBASE_CONFIG > firebase-config.json
    firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

---

## 📊 Best Practices

1. **Separare Dev e Prod** - Usa progetti Firebase separati
2. **Security Rules** - Sempre testa rules prima del deploy
3. **Emulatori** - Usa emulatori per development locale
4. **Indexes** - Crea indexes per query complesse
5. **Secrets** - MAI committare API keys nel repository
6. **Monitoring** - Abilita Firebase Performance Monitoring
7. **Budget** - Imposta budget alerts su Firebase Console
8. **Backup** - Configura backup automatici per Firestore
9. **Error Handling** - Gestisci sempre errori Firebase
10. **Offline** - Abilita persistenza offline per Firestore

---

## 📝 Checklist Setup Cliente

- [ ] Crea progetto Firebase per dev e prod
- [ ] Copia credenziali Firebase in `project.config.js`
- [ ] Abilita Authentication providers necessari
- [ ] Crea database Firestore con location appropriata
- [ ] Abilita Storage
- [ ] Deploy security rules
- [ ] Configura environments (dev/prod)
- [ ] Aggiungi secrets su GitHub
- [ ] Testa con emulatori locali
- [ ] Deploy prima versione
- [ ] Configura monitoring e alerts
- [ ] Documenta configurazione specifica cliente

---

**Ultima modifica:** Novembre 2025
