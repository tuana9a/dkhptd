import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";

@Component({
  selector: "[app-new-job-v1-row-class-id]",
  templateUrl: "./new-job-v1-row-class-id.component.html",
  styleUrls: ["./new-job-v1-row-class-id.component.scss"]
})
export class NewJobV1RowClassIdComponent implements OnInit {
  @Input() classId = "";
  @Input() termId = "";
  @Input() subjectName?: string;
  @Output() removeClassIdEvent = new EventEmitter<string>();
  @Input() findOnInit = true;

  faPlus = faPlus;
  faMinus = faMinus;

  constructor(private api: ClassToRegsitersApi) { }

  ngOnInit(): void {
    if (this.findOnInit) {
      this.api.findByTermIdAndClassId(this.termId, this.classId).subscribe(res => {
        if (res.success) {
          this.subjectName = res.data?.subjectName;
        }
      });
    }
  }

  onRemoveClassId(subjectId: string) {
    this.removeClassIdEvent.emit(subjectId);
  }
}
