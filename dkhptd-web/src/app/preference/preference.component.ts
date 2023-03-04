import { Component, Input, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference, Subject } from "src/entities";

@Component({
  selector: "[app-preference]",
  templateUrl: "./preference.component.html",
  styleUrls: ["./preference.component.scss"]
})
export class PreferenceComponent implements OnInit {
  @Input() preference: AccountPreference = new AccountPreference({ termId: "", wantedSubjectIds: [] });
  @Input() showUpdateButton = true;
  @Input() showId = true;
  @Input() showSearchBox = false;
  @Input() termId = "";

  constructor(private api: AccountsApi) { }

  ngOnInit(): void {
    //
  }

  openSearchBox() {
    this.showSearchBox = true;
  }

  closeSearchBox() {
    this.showSearchBox = false;
  }

  onAddSubjectId(subjectId: string) {
    if (subjectId && !subjectId.match(/^\s*$/)) {
      this.preference?.wantedSubjectIds?.push(subjectId);
    }
  }

  onRemoveSubjectId(subjectId: string) {
    if (!this.preference) return;
    this.preference.wantedSubjectIds = this.preference.wantedSubjectIds?.filter(x => x != subjectId);
  }

  onUpdatePreference() {
    if (!this.preference) return;
    this.api.changePreference(this.preference._id as string, this.preference).subscribe();
  }

  getSelectedSubjectIds() {
    return new Set(this.preference?.wantedSubjectIds);
  }

  onChecked(subject: Subject) {
    const subjectId = subject.subjectId;
    if (subjectId && !subjectId.match(/^\s*$/) && this.preference.wantedSubjectIds.indexOf(subjectId) == -1) {
      this.preference.wantedSubjectIds.push(subjectId);
    }
  }

  onUnchecked(subject: Subject) {
    const subjectId = subject.subjectId;
    if (subjectId && !subjectId.match(/^\s*$/)) {
      const i = this.preference.wantedSubjectIds.indexOf(subjectId);
      if (i != -1) {
        this.preference.wantedSubjectIds.splice(i, 1);
      }
    }
  }
}
