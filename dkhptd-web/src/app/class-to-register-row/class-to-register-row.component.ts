import { Component, Input, OnInit } from "@angular/core";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "tr[app-class-to-register-row]",
  templateUrl: "./class-to-register-row.component.html",
  styleUrls: ["./class-to-register-row.component.scss"]
})
export class ClassToRegisterRowComponent implements OnInit {
  @Input() c: ClassToRegister = new ClassToRegister({});
  @Input() showIdColumn = false;
  @Input() showCreatedAtColumn = false;

  ngOnInit(): void {
    //
  }
}
