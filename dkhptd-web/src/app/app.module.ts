import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
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
import { ManageJobV1Component } from "./manage-job-v1/manage-job-v1.component";
import { JobStatusPipe } from "src/app/job-status.pipe";
import { JobComponent } from "./job/job.component";
import { JobLogsComponent } from "./job-logs/job-logs.component";
import { ActionLogComponent } from "./action-log/action-log.component";
import { ToJsonPipe } from "src/app/to-json.pipe";
import { PasswordPipe } from "src/app/password.pipe";
import { JobRowComponent } from "./job-row/job-row.component";
import { UploadTkbXlsxComponent } from "./upload-tkb-xlsx/upload-tkb-xlsx.component";
import { NewJobSuggestionBoxComponent } from "./new-job-suggestion-box/new-job-suggestion-box.component";
import { ClassToRegisterRowComponent } from "./class-to-register-row/class-to-register-row.component";
import { ClassToRegisterTableComponent } from "./class-to-register-table/class-to-register-table.component";
import { MessagesComponent } from "./messages/messages.component";
import { HttpErrorInterceptor } from "src/interceptors/http-error.interceptor";
import { UnauthorizedInterceptor } from "src/interceptors/unauthorized.interceptor";
import { JobV1ResultComponent } from "./job-v1-result/job-v1-result.component";
import { JobV1ResultPageComponent } from "./job-v1-result-page/job-v1-result-page.component";
import { JobPageComponent } from "./job-page/job-page.component";
import { TermIdSearchClassToRegisterComponent } from "./term-id-search-class-to-register/term-id-search-class-to-register.component";
import { TermIdSearchClassToRegisterPageComponent } from "./term-id-search-class-to-register-page/term-id-search-class-to-register-page.component";
import { SearchClassToRegisterPageComponent } from "./search-class-to-register-page/search-class-to-register-page.component";
import { ManagePreferencePageComponent } from "./manage-preference-page/manage-preference-page.component";
import { PreferencesPageComponent } from "./preferences-page/preferences-page.component";
import { TermIdPreferencesPageComponent } from "./term-id-preferences-page/term-id-preferences-page.component";
import { PreferenceRowComponent } from "./preference-row/preference-row.component";
import { TermIdJobV1TableComponent } from "./term-id-job-v1-table/term-id-job-v1-table.component";
import { TermIdJobV1TablePageComponent } from "./term-id-job-v1-table-page/term-id-job-v1-table-page.component";
import { NewJobV1PageComponent } from "./new-job-v1-page/new-job-v1-page.component";
import { TermIdNewJobV1Component } from "./term-id-new-job-v1/term-id-new-job-v1.component";
import { ToastMessageComponent } from "./toast-message/toast-message.component";
import { ToastMessageInterceptor } from "src/interceptors/toast-message.interceptor";
import { ChooseTermIdPageComponent } from "./choose-term-id-page/choose-term-id-page.component";
import { TermIdNavbarComponent } from "./term-id-navbar/term-id-navbar.component";
import { QPipe } from "./q.pipe";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ManageTermIdComponent } from "./manage-term-id/manage-term-id.component";
import { SubjectRowComponent } from "./subject-row/subject-row.component";
import { SubjectTableComponent } from "./subject-table/subject-table.component";
import { SearchSubjectComponent } from "./search-subject/search-subject.component";
import { PreferenceRowSubjectComponent } from "./preference-row-subject/preference-row-subject.component";
import { TermIdPreferencePageComponent } from "./term-id-preference-page/term-id-preference-page.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "profile", component: ProfileComponent },
  { path: "home", component: HomeComponent },
  {
    path: "manage-job-v1", component: ManageJobV1Component, children: [
      { path: ":id", component: JobPageComponent },
    ]
  },
  { path: "upload-tkb-xlsx", component: UploadTkbXlsxComponent },
  { path: "manage-term-id", component: ManageTermIdComponent },
  { path: "messages", component: MessagesComponent },
  {
    path: "term-ids", component: ChooseTermIdPageComponent, children: [
      {
        path: ":termId", component: TermIdNavbarComponent, children: [
          { path: "new-job-v1", component: TermIdNewJobV1Component },
          {
            path: "manage-job-v1", component: TermIdJobV1TablePageComponent, children: [
              { path: ":id", component: JobPageComponent },
            ]
          },
          { path: "search-class-to-register", component: TermIdSearchClassToRegisterPageComponent },
          { path: "preferences", component: TermIdPreferencesPageComponent },
          { path: "preference", component: TermIdPreferencePageComponent },
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AppComponent,
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
    JobComponent,
    JobLogsComponent,
    ActionLogComponent,
    JobRowComponent,
    UploadTkbXlsxComponent,
    NewJobSuggestionBoxComponent,
    ClassToRegisterRowComponent,
    ClassToRegisterTableComponent,
    MessagesComponent,
    JobV1ResultComponent,
    JobV1ResultPageComponent,
    JobPageComponent,
    TermIdSearchClassToRegisterComponent,
    TermIdSearchClassToRegisterPageComponent,
    SearchClassToRegisterPageComponent,
    ManagePreferencePageComponent,
    PreferencesPageComponent,
    TermIdPreferencesPageComponent,
    PreferenceRowComponent,
    TermIdJobV1TableComponent,
    TermIdJobV1TablePageComponent,
    NewJobV1PageComponent,
    TermIdNewJobV1Component,
    ToastMessageComponent,
    ChooseTermIdPageComponent,
    TermIdNavbarComponent,
    QPipe,
    ManageTermIdComponent,
    SubjectRowComponent,
    SubjectTableComponent,
    SearchSubjectComponent,
    PreferenceRowSubjectComponent,
    TermIdPreferencePageComponent,
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
