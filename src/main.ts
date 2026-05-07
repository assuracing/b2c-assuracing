import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';

import 'moment/locale/fr';

registerLocaleData(fr);

bootstrapApplication(AppComponent, appConfig);
