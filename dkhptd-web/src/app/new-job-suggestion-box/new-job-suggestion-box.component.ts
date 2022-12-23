import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import AccountPreference from "src/entities/AccountPreference";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "[app-new-job-suggestion-box]",
  templateUrl: "./new-job-suggestion-box.component.html",
  styleUrls: ["./new-job-suggestion-box.component.scss"]
})
export class NewJobSuggestionBoxComponent implements OnInit {
  @Input() showIdColumn = false;
  @Input() showCreatedAtColumn = false;
  preferences?: AccountPreference[] = [];
  suggestionClassToRegisterByPreferences: ClassToRegister[] = [];
  @Input() selectedTermId? = "";
  @Output() classClickedEvent = new EventEmitter<ClassToRegister>();

  constructor(private classToRegisterApi: ClassToRegsitersApi, private accountsApi: AccountsApi) { }

  ngOnInit(): void {
    this.accountsApi.currentPreferences().subscribe(res => {
      if (res.success) {
        this.preferences = res.data;
        this.selectedTermId = this.preferences?.[0].termId;
        this.seachClassToRegisterByPreferences();
      }
    });
  }

  seachClassToRegisterByPreferences() {
    if (!this.preferences) return;
    for (const p of this.preferences) {
      const termId = p.termId;
      const wantedSubjectIds = p.wantedSubjectIds;
      for (const subjectId of wantedSubjectIds) {
        this.classToRegisterApi.find(`termId==${termId},subjectId==${subjectId}`, 0, 10).subscribe(res => {
          if (res.success && res.data) {
            this.suggestionClassToRegisterByPreferences.push(...res.data);
          }
        });
      }
    }
  }

  preferencesBySelectedTermId() {
    if (!this.preferences) return [];
    return this.preferences.filter(x => x.termId == this.selectedTermId);
  }

  onClassClickedEvent(c: ClassToRegister) {
    this.classClickedEvent.emit(c);
  }
}