/**
 * Authentication Service
 *
 * Provides authentication functionality using AWS Cognito via Amplify.
 * Follows Clean Architecture and SOLID principles.
 *
 * Responsibilities:
 * - User sign in/sign out
 * - Token management (automatic via Amplify)
 * - Session persistence
 * - Auth state management
 *
 * @see docs/AWS-BACKEND-INTEGRATION-GUIDE.md
 * @see docs/ANGULAR-IMPLEMENTATION-GUIDE.md
 */

import { Injectable, signal } from '@angular/core';
import { signIn, signOut, getCurrentUser, fetchAuthSession, fetchUserAttributes, SignInInput, SignInOutput } from 'aws-amplify/auth';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

import { AuthUser, AuthTokens, AuthState, CognitoError } from '../models/auth.model';

// =============================================================================
// Service
// =============================================================================

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Reactive state using Angular Signals (modern approach)
  private readonly _state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  });

  // Public read-only state
  public readonly state = this._state.asReadonly();

  // Observable state (for compatibility with older code)
  private readonly stateSubject = new BehaviorSubject<AuthState>(this._state());
  public readonly state$ = this.stateSubject.asObservable();

  // ==========================================================================
  // Initialization
  // ==========================================================================

  constructor() {
    // Check if user is already authenticated on service creation
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated (e.g., from previous session)
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      this.setLoading(true);

      const user = await getCurrentUser();
      const session = await fetchAuthSession();

      if (user && session.tokens) {
        // Try to fetch user attributes, but don't fail if it's not available
        let email: string | undefined;
        let emailVerified = false;
        let name: string | undefined;
        let givenName: string | undefined;
        let familyName: string | undefined;

        try {
          const attributes = await fetchUserAttributes();
          email = attributes.email;
          emailVerified = attributes.email_verified === 'true';
          name = attributes.name;
          givenName = attributes.given_name;
          familyName = attributes.family_name;
        } catch (attrError) {
          console.warn('Could not fetch user attributes:', attrError);
          // Use username as fallback
        }

        const authUser: AuthUser = {
          userId: user.userId,
          username: user.username,
          email: email,
          emailVerified: emailVerified,
          name: name,
          givenName: givenName,
          familyName: familyName,
        };

        this.setState({
          isAuthenticated: true,
          user: authUser,
          loading: false,
          error: null,
        });

        console.log('✅ User session restored:', authUser.email || authUser.username);
      }
    } catch (_error) {
      // No active session, user needs to log in
      this.setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }

  // ==========================================================================
  // Authentication Methods
  // ==========================================================================

  /**
   * Sign in with email and password
   *
   * @param email - User email
   * @param password - User password
   * @returns Observable with sign-in result
   */
  signIn$(email: string, password: string): Observable<SignInOutput> {
    this.setLoading(true);
    this.setError(null);

    const signInInput: SignInInput = {
      username: email,
      password: password,
    };

    return from(signIn(signInInput)).pipe(
      switchMap(async (result) => {
        if (result.isSignedIn) {
          // Get user details
          const user = await getCurrentUser();

          // Try to fetch user attributes, but don't fail if it's not available
          let email: string | undefined;
          let emailVerified = false;
          let name: string | undefined;
          let givenName: string | undefined;
          let familyName: string | undefined;

          try {
            const attributes = await fetchUserAttributes();
            email = attributes.email;
            emailVerified = attributes.email_verified === 'true';
            name = attributes.name;
            givenName = attributes.given_name;
            familyName = attributes.family_name;
          } catch (attrError) {
            console.warn('Could not fetch user attributes:', attrError);
            // Use username as fallback
          }

          const authUser: AuthUser = {
            userId: user.userId,
            username: user.username,
            email: email,
            emailVerified: emailVerified,
            name: name,
            givenName: givenName,
            familyName: familyName,
          };

          this.setState({
            isAuthenticated: true,
            user: authUser,
            loading: false,
            error: null,
          });

          console.log('✅ Sign in successful:', authUser.email || authUser.username);
        } else {
          this.setLoading(false);
        }
        return result;
      }),
      catchError((error) => {
        const errorMessage = this.parseAuthError(error);
        this.setError(errorMessage);
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Sign out current user
   *
   * @returns Observable with sign-out result
   */
  signOut$(): Observable<void> {
    this.setLoading(true);

    return from(signOut()).pipe(
      tap(() => {
        this.setState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });

        console.log('✅ Sign out successful');
      }),
      catchError((error) => {
        const errorMessage = this.parseAuthError(error);
        this.setError(errorMessage);
        this.setLoading(false);
        throw error;
      })
    );
  }

  /**
   * Get current authenticated user
   *
   * @returns Observable with current user or null
   */
  getCurrentUser$(): Observable<AuthUser | null> {
    return from(getCurrentUser()).pipe(
      map((user) => ({
        userId: user.userId,
        username: user.username,
      })),
      catchError(() => from([null]))
    );
  }

  /**
   * Get current session tokens
   *
   * @returns Observable with auth tokens
   */
  getTokens$(): Observable<AuthTokens | null> {
    return from(fetchAuthSession()).pipe(
      map((session) => {
        if (!session.tokens) {
          return null;
        }

        return {
          accessToken: session.tokens.accessToken.toString(),
          idToken: session.tokens.idToken?.toString() || '',
        };
      }),
      catchError(() => from([null]))
    );
  }

  /**
   * Get access token (for API calls)
   *
   * This is the main method for getting the JWT token for API authentication.
   * Amplify handles token refresh automatically.
   *
   * @returns Promise with access token or null
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken.toString() || null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated(): boolean {
    return this._state().isAuthenticated;
  }

  /**
   * Get current user (synchronous)
   */
  getUser(): AuthUser | null {
    return this._state().user;
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.setState({
      ...this._state(),
      loading,
    });
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.setState({
      ...this._state(),
      error,
    });
  }

  /**
   * Update entire state
   */
  private setState(newState: AuthState): void {
    this._state.set(newState);
    this.stateSubject.next(newState);
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  /**
   * Parse Cognito/Amplify errors into user-friendly messages
   */
  private parseAuthError(error: CognitoError): string {
    const errorCode = error?.name || error?.code || 'UnknownError';
    const errorMessage = error?.message || 'An unknown error occurred';

    switch (errorCode) {
      case 'UserNotFoundException':
        return 'User not found. Please check your email.';

      case 'NotAuthorizedException':
        return 'Incorrect email or password.';

      case 'UserNotConfirmedException':
        return 'Please verify your email before signing in.';

      case 'PasswordResetRequiredException':
        return 'Password reset required. Please reset your password.';

      case 'InvalidParameterException':
        return 'Invalid input. Please check your email and password.';

      case 'TooManyRequestsException':
        return 'Too many attempts. Please try again later.';

      case 'NetworkError':
        return 'Network error. Please check your internet connection.';

      default:
        console.error('Auth error:', { errorCode, errorMessage });
        return errorMessage;
    }
  }
}
