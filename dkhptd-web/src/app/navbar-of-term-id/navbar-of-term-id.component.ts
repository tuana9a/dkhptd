import { Component, OnInit } from "@angular/core";
import { Session } from "src/repositories/is-authorized.repo";

@Component({
  selector: "app-navbar-of-term-id",
  templateUrl: "./navbar-of-term-id.component.html",
  styleUrls: ["./navbar-of-term-id.component.scss"]
})
export class NavbarOfTermIdComponent implements OnInit {

  constructor(private session: Session) { }

  ngOnInit(): void {
    //
  }

  showUploadTKB() {
    return this.session.isAdmin();
  }
  showPrefereces() {
    return this.session.isAuthorized;
  }
  showSearchClassToRegister() {
    return true;
  }
  showNewJobV1() {
    return this.session.isAuthorized;
  }
  showManageJobs() {
    return this.session.isAuthorized;
  }
  showManageJobByTermIds() {
    return this.session.isAuthorized;
  }
  showProfile() {
    return this.session.isAuthorized;
  }
}
