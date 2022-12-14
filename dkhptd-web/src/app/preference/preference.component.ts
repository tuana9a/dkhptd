import { Component, OnInit } from "@angular/core";
import { AccountsPreferenceApi as AccountsPreferencesApi } from "src/apis/accounts-preferences.api";
import AccountPreference from "src/entities/AccountPreference";

@Component({
  selector: "app-preference",
  templateUrl: "./preference.component.html",
  styleUrls: ["./preference.component.scss"]
})
export class PreferenceComponent implements OnInit {
  preferences?: AccountPreference[];
  newTermId = "";
  newWantedSubjectIds = "";

  constructor(private api: AccountsPreferencesApi) { }

  ngOnInit(): void {
    this.api.currentPreferences().subscribe(res => {
      if (res.success) {
        this.preferences = res.data;
      }
    });
  }
}
