import { Component, Input, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference } from "src/entities";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "[app-preferences]",
  templateUrl: "./preferences.component.html",
  styleUrls: ["./preferences.component.scss"]
})
export class PreferencesComponent implements OnInit {
  @Input() termId = "";
  @Input() preferences: AccountPreference[] = [];
  @Input() showId = false;
  message?: string;
  newWantedSubjectIds: Set<string> = new Set();
  newSubjectId = "";
  faPlus = faPlus;
  faMinus = faMinus;


  constructor(private api: AccountsApi) { }

  ngOnInit(): void {
    //
  }

  showAddSection() {
    return this.preferences?.length == 0;
  }

  fetchAll() {
    this.api.currentPreferencesOfTermId(this.termId).subscribe(res => {
      if (res.success) {
        if (res.data) {
          this.preferences = res.data;
        }
      }
    });
  }
}
