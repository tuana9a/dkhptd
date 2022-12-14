import { Component, OnInit } from "@angular/core";
import { PublicApi } from "src/apis/public.api";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"]
})
export class SignupComponent implements OnInit {
  username = "";
  password = "";

  constructor(private publicApi: PublicApi) { }

  ngOnInit(): void {
    //
  }

  signup() {
    this.publicApi.signup(this.username, this.password).subscribe(res => {
      if (res.success) {
        // TODO
      }
    });
  }
}
