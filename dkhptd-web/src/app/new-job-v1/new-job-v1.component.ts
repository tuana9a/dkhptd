import { Component, OnInit } from "@angular/core";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "app-new-job-v1",
  templateUrl: "./new-job-v1.component.html",
  styleUrls: ["./new-job-v1.component.scss"]
})
export class NewJobV1 implements OnInit {
  username = "";
  password = "";
  timeToStart = "";
  classIds: Set<string> = new Set();
  classId = "";
  message?: string;

  constructor(private api: DKHPTDV1sApi) { }

  ngOnInit(): void {
    //
  }

  onSubmit() {
    const timeToStart = new Date(this.timeToStart).getTime();
    const classIds = Array.from(this.classIds).map(x => x.trim()).filter(x => x);
    this.api.submitCurrentNewJobV1(this.username, this.password, classIds, timeToStart).subscribe(res => {
      this.message = res.success ? "Thành Công" : res.message;
    }, err => {
      this.message = err.message;
    });
  }

  onAddClassId() {
    if (this.classId && !this.classId.match(/^\s*$/)) {
      this.classIds.add(this.classId);
    }
  }

  onDeleteClassId(classId: string) {
    this.classIds.delete(classId);
  }

  onKeyPressClassId(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.onAddClassId();
    }
  }

  onClassClickedEvent(c: ClassToRegister) {
    if (c.classId) {
      this.classIds.add(String(c.classId));
    }
  }
}
