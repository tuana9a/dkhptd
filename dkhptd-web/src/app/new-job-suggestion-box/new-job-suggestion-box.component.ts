import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AccountsApi } from "src/apis/accounts.api";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import { AccountPreference } from "src/entities";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "[app-new-job-suggestion-box]",
  templateUrl: "./new-job-suggestion-box.component.html",
  styleUrls: ["./new-job-suggestion-box.component.scss"]
})
export class NewJobSuggestionBoxComponent implements OnInit {
  @Input() showId = false;
  @Input() showCreatedAt = false;
  preferences?: AccountPreference[] = [];
  suggestClasses: ClassToRegister[] = [];
  @Input() selectedTermId?= "";
  @Input() termId = "";
  @Output() classClicked = new EventEmitter<ClassToRegister>();
  @Output() uncheckedEvent = new EventEmitter<ClassToRegister>();
  @Output() checkedEvent = new EventEmitter<ClassToRegister>();
  @Input() checkedClassIds: Set<number | undefined> = new Set();

  constructor(private classToRegisterApi: ClassToRegsitersApi, private accountsApi: AccountsApi, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.termId = params["termId"];
      this.accountsApi.currentPreferencesOfTermId(this.termId).subscribe(res => {
        if (res.success) {
          this.preferences = res.data;
          this.seachClassToRegisterByPreferences();
        }
      });
    });
  }

  seachClassToRegisterByPreferences() {
    if (!this.preferences) return;
    for (const p of this.preferences) {
      const termId = p.termId;
      const wantedSubjectIds = p.wantedSubjectIds;
      for (const subjectId of wantedSubjectIds) {
        this.classToRegisterApi.findClassesOfTermId(termId, `subjectId==${subjectId}`, 0, 10).subscribe(res => {
          if (res.success && res.data) {
            this.suggestClasses.push(...res.data);
          }
        });
      }
    }
  }

  onClassClickedEvent(c: ClassToRegister) {
    this.classClicked.emit(c);
  }

  onUnchecked(s: ClassToRegister) {
    this.uncheckedEvent.emit(s);
  }

  onChecked(s: ClassToRegister) {
    this.checkedEvent.emit(s);
  }
}