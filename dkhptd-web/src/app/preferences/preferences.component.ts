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
  @Input() preferences?: AccountPreference[] = [];
  message?: string;
  newWantedSubjectIds: string[] = [];
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

  addPreference() {
    const p = new AccountPreference({ termId: this.termId, wantedSubjectIds: this.newWantedSubjectIds });
    this.api.addPreference(p).subscribe(() => this.fetchAll());
  }

  fetchAll() {
    this.api.currentPreferences().subscribe(res => {
      if (res.success) {
        this.preferences = res.data;
      }
    });
  }

  onAddNewSubjectId() {
    if (this.newSubjectId && !this.newSubjectId.match(/^\s*$/)) {
      this.newWantedSubjectIds?.push(this.newSubjectId);
    }
  }

  onRemoveNewSubjectId(subjectId: string) {
    this.newWantedSubjectIds = this.newWantedSubjectIds?.filter(x => x != subjectId);
  }

  onKeyPressNewSubjectId(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.onAddNewSubjectId();
    }
  }
}
