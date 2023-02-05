import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SearchClassToRegisterComponent } from "./search-class-to-register/search-class-to-register.component";
import { PreferenceComponent } from "./preference/preference.component";
import { PreferencesComponent } from "./preferences/preferences.component";
import { NewJobV1 } from "./new-job-v1/new-job-v1.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BaseUrlInterceptor } from "src/interceptors/base-url.interceptor";
import { JwtInterceptor } from "src/interceptors/jwt.interceptor";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { HomeComponent } from "./home/home.component";
import { SignupComponent } from "./signup/signup.component";
import { FormsModule } from "@angular/forms";
import { ManageJobV1Component } from "./manage-dkhptd-job-v1/manage-dkhptd-job-v1.component";
import { JobStatusPipe } from "src/pipes/job-status.pipe";
import { DkhptdJobComponent } from "./dkhptd-job/dkhptd-job.component";
import { DkhptdJobLogsComponent } from "./dkhptd-job-logs/dkhptd-job-logs.component";
import { ActionLogComponent } from "./action-log/action-log.component";
import { ToJsonPipe } from "src/pipes/to-json.pipe";
import { PasswordPipe } from "src/pipes/password.pipe";
import { DkhptdJobRowComponent } from "./dkhptd-job-row/dkhptd-job-row.component";
import { UploadTkbXlsxComponent } from "./upload-tkb-xlsx/upload-tkb-xlsx.component";
import { NewJobSuggestionBoxComponent } from "./new-job-suggestion-box/new-job-suggestion-box.component";
import { ClassToRegisterRowComponent } from "./class-to-register-row/class-to-register-row.component";
import { ClassToRegisterTableComponent } from "./class-to-register-table/class-to-register-table.component";
import { MessagesComponent } from "./messages/messages.component";
import { HttpErrorInterceptor } from "src/interceptors/http-error.interceptor";
import { UnauthorizedInterceptor } from "src/interceptors/unauthorized.interceptor";
import { DkhptdJobV1ResultComponent } from "./dkhptd-job-v1-result/dkhptd-job-v1-result.component";
import { DkhptdJobV1ResultPageComponent } from "./dkhptd-job-v1-result-page/dkhptd-job-v1-result-page.component";
import { DkhptdJobPageComponent } from "./dkhptd-job-page/dkhptd-job-page.component";
import { TermIdSearchClassToRegisterComponent } from "./term-id-search-class-to-register/term-id-search-class-to-register.component";
import { SearchClassToRegisterOfTermIdPageComponent } from "./search-class-to-register-of-term-id-page/search-class-to-register-of-term-id-page.component";
import { SearchClassToRegisterPageComponent } from "./search-class-to-register-page/search-class-to-register-page.component";
import { ManagePreferencePageComponent } from "./manage-preference-page/manage-preference-page.component";
import { PreferencesPageComponent } from "./preferences-page/preferences-page.component";
import { PreferencesOfTermIdPageComponent } from "./preferences-of-term-id-page/preferences-of-term-id-page.component";
import { PreferenceRowComponent } from "./preference-row/preference-row.component";
import { ManageJobV1ByTermIdsComponent } from "./manage-job-v1-by-term-ids/manage-job-v1-by-term-ids.component";
import { JobV1TableOfTermIdComponent } from "./job-v1-table-of-term-id/job-v1-table-of-term-id.component";
import { JobV1TableOfTermIdPageComponent } from "./job-v1-table-of-term-id-page/job-v1-table-of-term-id-page.component";
import { NewJobV1PageComponent } from "./new-job-v1-page/new-job-v1-page.component";
import { NewJobV1ForTermIdComponent } from "./new-job-v1-for-term-id/new-job-v1-for-term-id.component";
import { ToastMessageComponent } from "./toast-message/toast-message.component";
import { ToastMessageInterceptor } from "src/interceptors/toast-message.interceptor";
import { ChooseTermIdPageComponent } from "./choose-term-id-page/choose-term-id-page.component";
import { NavbarOfTermIdComponent } from "./navbar-of-term-id/navbar-of-term-id.component";
import { QPipe } from "./q.pipe";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "profile", component: ProfileComponent },
  { path: "home", component: HomeComponent },
  { path: "v1/manage-job", component: ManageJobV1Component },
  { path: "v1/dkhptd-s/:id", component: DkhptdJobPageComponent },
  { path: "upload-tkb-xlsx", component: UploadTkbXlsxComponent },
  { path: "messages", component: MessagesComponent },
  {
    path: "term-ids", component: ChooseTermIdPageComponent, children: [
      {
        path: ":termId", component: NavbarOfTermIdComponent, children: [
          { path: "v1/jobs/new", component: NewJobV1ForTermIdComponent },
          { path: "v1/manage-jobs", component: JobV1TableOfTermIdPageComponent },
          { path: "search-class-to-register", component: SearchClassToRegisterOfTermIdPageComponent },
          { path: "preferences", component: PreferencesOfTermIdPageComponent }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
    SearchClassToRegisterComponent,
    PreferenceComponent,
    PreferencesComponent,
    NewJobV1,
    LoginComponent,
    ProfileComponent,
    HomeComponent,
    SignupComponent,
    ManageJobV1Component,
    JobStatusPipe,
    ToJsonPipe,
    PasswordPipe,
    DkhptdJobComponent,
    DkhptdJobLogsComponent,
    ActionLogComponent,
    DkhptdJobRowComponent,
    UploadTkbXlsxComponent,
    NewJobSuggestionBoxComponent,
    ClassToRegisterRowComponent,
    ClassToRegisterTableComponent,
    MessagesComponent,
    DkhptdJobV1ResultComponent,
    DkhptdJobV1ResultPageComponent,
    DkhptdJobPageComponent,
    TermIdSearchClassToRegisterComponent,
    SearchClassToRegisterOfTermIdPageComponent,
    SearchClassToRegisterPageComponent,
    ManagePreferencePageComponent,
    PreferencesPageComponent,
    PreferencesOfTermIdPageComponent,
    PreferenceRowComponent,
    ManageJobV1ByTermIdsComponent,
    JobV1TableOfTermIdComponent,
    JobV1TableOfTermIdPageComponent,
    NewJobV1PageComponent,
    NewJobV1ForTermIdComponent,
    ToastMessageComponent,
    ChooseTermIdPageComponent,
    NavbarOfTermIdComponent,
    QPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule, RouterModule.forRoot(routes, { paramsInheritanceStrategy: "always" }), FontAwesomeModule,
  ],
  exports: [RouterModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ToastMessageInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
