import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "table[app-class-to-register-table]",
  templateUrl: "./class-to-register-table.component.html",
  styleUrls: ["./class-to-register-table.component.scss"]
})
export class ClassToRegisterTableComponent {
  @Input() showId = false;
  @Input() showCreatedAt = true;
  @Input() showQueryKeys = false;
  @Input() classes: ClassToRegister[] = [];
  @Output() classClickedEvent = new EventEmitter<ClassToRegister>();
  @Input() hoverClass = "mouse-out";
  @Input() showCheckbox = true;
  @Output() uncheckedEvent = new EventEmitter<ClassToRegister>();
  @Output() checkedEvent = new EventEmitter<ClassToRegister>();
  @Input() checkedClassIds: Set<number | undefined> = new Set();

  onClassClicked(c: ClassToRegister) {
    this.classClickedEvent.emit(c);
  }

  onMouseOver() {
    this.hoverClass = "mouse-over";
  }

  onMouseOut() {
    this.hoverClass = "mouse-out";
  }

  onUnchecked(s: ClassToRegister) {
    this.uncheckedEvent.emit(s);
  }

  onChecked(s: ClassToRegister) {
    this.checkedEvent.emit(s);
  }
}
