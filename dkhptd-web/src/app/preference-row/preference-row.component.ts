import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference } from "src/entities";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "[app-preference-row]",
  templateUrl: "./preference-row.component.html",
  styleUrls: ["./preference-row.component.scss"]
})
export class PreferenceRowComponent implements OnInit {
  @Input() preference: AccountPreference = new AccountPreference({ termId: "", wantedSubjectIds: [] });
  @Input() showUpdateButton = true;
  @Input() showAddButton = true;
  @Input() showId = true;
  @Output() afterAddPreference = new EventEmitter<unknown>();
  subjectId = "";
  message?= "";
  faPlus = faPlus;
  faMinus = faMinus;

  constructor(private api: AccountsApi) { }

  ngOnInit(): void {
    //
  }

  onAddSubjectId() {
    if (this.subjectId && !this.subjectId.match(/^\s*$/)) {
      this.preference?.wantedSubjectIds?.push(this.subjectId);
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

  onAddPreference() {
    this.api.addPreference(this.preference).subscribe(res => {
      if (res.success) {
        this.afterAddPreference.emit();
      }
    });
  }

  onKeyPressSubjectId(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.onAddSubjectId();
    }
  }
}
