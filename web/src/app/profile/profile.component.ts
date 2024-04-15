import { Component, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { Account } from "src/entities";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  account: Account = new Account({ username: "", password: "" });
  newPassword = "";

  constructor(private accountsApi: AccountsApi, private toast: ToastService) { }

  ngOnInit(): void {
    this.accountsApi.current().subscribe((res) => {
      if (res.success) {
        this.account = res.data as Account;
      }
    });
  }

  onChangePassword() {
    this.accountsApi.changeCurrentPassword(this.newPassword).subscribe(res => this.toast.handleResponse(res));
  }

  onChangeName() {
    // TODO: change name
  }
}
