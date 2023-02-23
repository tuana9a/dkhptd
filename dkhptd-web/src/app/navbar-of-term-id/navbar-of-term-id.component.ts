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
  showAnyway() {
    return true;
  }
  showIfAuthorized() {
    return this.session.isAuthorized;
  }
}
