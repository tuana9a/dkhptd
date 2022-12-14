import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SearchClassToRegisterComponent } from "./search-class-to-register/search-class-to-register.component";
import { PreferenceComponent } from "./preference/preference.component";
import { WorkerStatusDoingComponent } from "./worker-status-doing/worker-status-doing.component";
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
  { path: "preference", component: PreferenceComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    SearchClassToRegisterComponent,
    PreferenceComponent,
    WorkerStatusDoingComponent,
    NewJobV1,
    LoginComponent,
    ProfileComponent,
    HomeComponent,
    SignupComponent,
    ManageDKHPTDJOBV1Component,
    JobStatusPipe,
    ToJsonPipe,
    DkhptdJobComponent,
    DkhptdJobLogsComponent,
    ActionLogComponent,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
