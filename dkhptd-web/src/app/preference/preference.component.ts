import { Component, Input, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import AccountPreference from "src/entities/AccountPreference";

@Component({
  selector: "[app-preference]",
  templateUrl: "./preference.component.html",
  styleUrls: ["./preference.component.scss"]
})
export class PreferenceComponent implements OnInit {
  @Input() preference!: AccountPreference;
  @Input() showUpdateButton = true;
  @Input() showIdColumn = true;
  subjectId = "";
  message?= "";
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
    this.preference.wantedSubjectIds = this.preference.wantedSubjectIds?.filter(x => x != subjectId);
  }

  onUpdatePreference() {
    this.api.changePreference(this.preference._id as string, this.preference).subscribe(res => {
      this.message = res.success ? "SUCCESS" : res.message;
      if (res.success) {
        this.preference = res.data as AccountPreference;
      }
    });
  }

  onKeyPressSubjectId(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.onAddSubjectId();
    }
  }
}
