import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subject } from "src/entities";

@Component({
  selector: "table[app-subject-table]",
  templateUrl: "./subject-table.component.html",
  styleUrls: ["./subject-table.component.scss"]
})
export class SubjectTableComponent {
  @Input() showCheckbox = true;
  @Input() showId = false;
  @Input() showQueryKeys = false;
  @Input() subjects: Subject[] = [];
  @Output() subjectClickedEvent = new EventEmitter<Subject>();
  @Input() hoverClass = "mouse-out";
  @Output() uncheckedEvent = new EventEmitter<Subject>();
  @Output() checkedEvent = new EventEmitter<Subject>();
  @Input() checkedSubjectIds: Set<string | undefined> = new Set();

  onSubjectClicked(s: Subject) {
    this.subjectClickedEvent.emit(s);
  }

  onMouseOver() {
    this.hoverClass = "mouse-over";
  }

  onMouseOut() {
    this.hoverClass = "mouse-out";
  }

  onUnchecked(s: Subject) {
    this.uncheckedEvent.emit(s);
  }

  onChecked(s: Subject) {
    this.checkedEvent.emit(s);
  }
}
