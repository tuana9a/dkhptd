import { Component, Input, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference, Subject } from "src/entities";
import { ToastService } from "src/repositories/toast-messages.repo";

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

  constructor(private api: AccountsApi, private toast: ToastService) { }

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
    if (!this.preference._id) return;
    this.api.changePreference(this.preference._id, this.preference).subscribe(res => this.toast.handleResponse(res));
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
