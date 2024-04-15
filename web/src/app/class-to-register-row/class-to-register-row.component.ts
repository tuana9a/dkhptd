import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "tr[app-class-to-register-row]",
  templateUrl: "./class-to-register-row.component.html",
  styleUrls: ["./class-to-register-row.component.scss"]
})
export class ClassToRegisterRowComponent implements OnInit {
  @Input() c: ClassToRegister = new ClassToRegister({});
  @Input() showId = false;
  @Input() showCreatedAt = false;
  @Input() showCheckbox = true;
  @Input() checked = false;
  @Output() uncheckedEvent = new EventEmitter<ClassToRegister>();
  @Output() checkedEvent = new EventEmitter<ClassToRegister>();

  ngOnInit(): void {
    //
  }

  onCheckboxChange() {
    return this.checked ? this.checkedEvent.emit(this.c) : this.uncheckedEvent.emit(this.c);
  }
}
