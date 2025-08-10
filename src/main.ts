import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import * as firebase from 'firebase/app';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
firebase.initializeApp({
  apiKey: 'AIzaSyAUxV-zb_vfwhj58MH09LeTQx-Uu9xavDY',
  authDomain: 'innchats.firebaseapp.com',
  projectId: 'innchats',
  storageBucket: 'innchats.firebasestorage.app',
  messagingSenderId: '387908777480',
  appId: '1:387908777480:web:a85dd95e7f1584f73643bd',
  measurementId: 'G-EF3EVV5GM1',
});
