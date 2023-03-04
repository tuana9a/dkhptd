import { Component, OnInit } from "@angular/core";
import { Session } from "src/repositories/is-authorized.repo";

@Component({
  selector: "app-term-id-navbar",
  templateUrl: "./term-id-navbar.component.html",
  styleUrls: ["./term-id-navbar.component.scss"]
})
export class TermIdNavbarComponent implements OnInit {

  constructor(private session: Session) { }

  ngOnInit(): void {
    //
  }
  showAnyway() {
    return true;
  }
  showIfAuthorized() {
    return this.session.isAuthorized;
  }
}
