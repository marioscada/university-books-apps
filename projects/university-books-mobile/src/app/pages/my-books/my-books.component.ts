import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner } from '@ionic/angular/standalone';
import { BooksService } from '../../books/services/books.service';

@Component({
  selector: 'app-my-books',
  templateUrl: './my-books.component.html',
  styleUrls: ['./my-books.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner
  ],
})
export class MyBooksComponent implements OnInit {
  private readonly booksService = inject(BooksService);
  private readonly destroyRef = takeUntilDestroyed();

  public readonly loading = signal<boolean>(true);
  public readonly booksData = signal<unknown>(null);
  public readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);

    // ⚠️ Subscribe necessario (non async pipe) perché:
    // Dobbiamo gestire loading state e error state con signals per UI feedback immediato
    this.booksService
      .listBooks({
        page: '1',
        limit: '20',
        status: 'PUBLISHED',
      })
      .pipe(this.destroyRef)
      .subscribe({
        next: (response) => {
          this.booksData.set(response);
          this.loading.set(false);
          console.log('📚 Books loaded:', response);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to load books');
          this.loading.set(false);
          console.error('❌ Error loading books:', err);
        },
      });
  }
}
