import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import createAuth0Client, { PopupLoginOptions } from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, concatMap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Create an observable of Auth0 instance of client
  auth0Client$ = (from(
    createAuth0Client({
      domain: environment.authZeroDomain,
      client_id: environment.authZeroClient,
      redirect_uri: `${window.location.origin}`,
      cacheLocation: 'localstorage',
    })
  ) as Observable<Auth0Client>).pipe(
    shareReplay(1), // Every subscription receives the same shared value
    catchError((err) => throwError(err))
  );
  // Define observables for SDK methods that return promises by default
  // For each Auth0 SDK method, first ensure the client instance is ready
  // concatMap: Using the client instance, call SDK method; SDK returns a promise
  // from: Convert that resulting promise into an observable
  // Create subject and public observable of user profile data
  userProfile$ = new BehaviorSubject<any>(null);
  // userProfile$ = this.userProfileSubject$.asObservable();
  // Create a local property for login status

  constructor() {
    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    // this.localAuthSetup();
    this.getUser$();
  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser
  getUser$(options?): void {
    this.auth0Client$.subscribe((client) => {
      client.getUser(options).then((user) => {
        this.userProfile$.next(user);
      });
    });
  }

  login(): void {
    // A desired redirect path can be passed to login method
    // (e.g., from a route guard)
    // Ensure Auth0 client instance exists
    const options: PopupLoginOptions = {
      display: 'popup',
      prompt: 'login',
    };
    this.auth0Client$.subscribe(async (client: Auth0Client) => {
      console.log('client', client);
      // Call method to log in
      await client.loginWithPopup(options);
      this.getUser$();
    });
  }

  logout(): void {
    // Ensure Auth0 client instance exists
    this.auth0Client$.subscribe((client: Auth0Client) => {
      // Call method to log out
      client.logout({
        client_id: environment.authZeroClient,
        localOnly: true,
        // returnTo: `${window.location.origin}`,
      });
      this.getUser$();
    });
  }
}
