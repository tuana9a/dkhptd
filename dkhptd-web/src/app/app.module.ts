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
import { ManageDKHPTDJOBV1Component } from "./manage-dkhptd-job-v1/manage-dkhptd-job-v1.component";
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

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "profile", component: ProfileComponent },
  { path: "home", component: HomeComponent },
  {
    path: "manage-jobs", component: ManageDKHPTDJOBV1Component, children: [
      { path: ":id", component: DkhptdJobComponent }
    ]
  },
  { path: "new-job-v1", component: NewJobV1 },
  { path: "search-class-to-register", component: SearchClassToRegisterComponent },
  { path: "preferences", component: PreferencesComponent },
  { path: "upload-tkb-xlsx", component: UploadTkbXlsxComponent },
  { path: "messages", component: MessagesComponent },
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
    ManageDKHPTDJOBV1Component,
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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule, RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
