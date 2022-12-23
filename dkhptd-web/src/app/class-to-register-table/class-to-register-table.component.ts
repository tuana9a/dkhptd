import { Component, EventEmitter, Input, Output } from "@angular/core";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "table[app-class-to-register-table]",
  templateUrl: "./class-to-register-table.component.html",
  styleUrls: ["./class-to-register-table.component.scss"]
})
export class ClassToRegisterTableComponent {
  @Input() showIdColumn = false;
  @Input() showCreatedAtColumn = true;
  @Input() classes: ClassToRegister[] = [];
  @Output() classClickedEvent = new EventEmitter<ClassToRegister>();
  @Input() hoverClass = "mouse-out";

  onClickClass(c: ClassToRegister) {
    this.classClickedEvent.emit(c);
  }

  onMouseOver() {
    this.hoverClass = "mouse-over";
  }

  onMouseOut() {
    this.hoverClass = "mouse-out";
  }
}
