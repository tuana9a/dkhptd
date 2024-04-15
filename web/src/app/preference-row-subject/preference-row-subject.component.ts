import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { SubjectsApi } from "src/apis/subjects.apis";

@Component({
  selector: "[app-preference-row-subject]",
  templateUrl: "./preference-row-subject.component.html",
  styleUrls: ["./preference-row-subject.component.scss"]
})
export class PreferenceRowSubjectComponent implements OnInit {
  @Input() subjectId = "";
  @Input() subjectName?= "";
  @Output() removeSubjectIdEvent = new EventEmitter<string>();

  faPlus = faPlus;
  faMinus = faMinus;

  constructor(private subjectsApi: SubjectsApi) { }

  ngOnInit(): void {
    this.subjectsApi.findBySubjectId(this.subjectId).subscribe(res => {
      if (res.success) {
        this.subjectName = res.data?.subjectName;
      }
    });
  }

  onRemoveSubjectId(subjectId: string) {
    this.removeSubjectIdEvent.emit(subjectId);
  }
}
