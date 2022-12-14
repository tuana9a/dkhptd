import { Component, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import Account from "src/entities/Account";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  account: Account = new Account({});
  newPassword = "";

  constructor(private accountsApi: AccountsApi) { }

  ngOnInit(): void {
    this.accountsApi.current().subscribe((res) => {
      if (res.success) {
        this.account = res.data as Account;
      }
    });
  }

  onChangePassword() {
    this.accountsApi.changeCurrentPassword(this.newPassword).subscribe(res => {
      if (res.success) {
        // TODO: toast
      }
    });
  }

  onChangeName() {
    // TODO: change name
  }
}
