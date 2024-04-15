import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Subject } from "src/entities";

@Component({
  selector: "tr[app-subject-row]",
  templateUrl: "./subject-row.component.html",
  styleUrls: ["./subject-row.component.scss"]
})
export class SubjectRowComponent implements OnInit {
  @Input() s: Subject = new Subject({});
  @Input() showId = false;
  @Input() showCheckbox = true;
  @Input() checked = false;
  @Output() uncheckedEvent = new EventEmitter<Subject>();
  @Output() checkedEvent = new EventEmitter<Subject>();

  ngOnInit(): void {
    //
  }

  onCheckboxChange() {
    return this.checked ? this.checkedEvent.emit(this.s) : this.uncheckedEvent.emit(this.s);
  }
}
