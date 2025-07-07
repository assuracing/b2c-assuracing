import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GuaranteeChoiceComponent } from './guarantee-choice/guarantee-choice.component';
import { YearlyGuaranteeComponent } from './yearly-guarantee/yearly-guarantee.component';
import { MotorsLeagueComponent } from './motors-league/motors-league.component';
import { EventCoverageComponent } from './event-coverage/event-coverage.component';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'guarantee-choice', component: GuaranteeChoiceComponent },
    { path: 'yearly-guarantee', component: YearlyGuaranteeComponent },
    { path: 'motors-league', component: MotorsLeagueComponent },
    { path: 'event-coverage', component: EventCoverageComponent },
    { path: 'payment-confirm', component: PaymentConfirmComponent }
];