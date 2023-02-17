import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { TermIdsJobV1sApi } from "src/apis/term-ids.dkhptd-v1-s.api";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "[app-new-job-v1]",
  templateUrl: "./new-job-v1.component.html",
  styleUrls: ["./new-job-v1.component.scss"]
})
export class NewJobV1 implements OnInit {
  @Input() termId = "";
  username = "";
  password = "";
  @Input() timeToStart = "";
  @Input() classIds: Set<string> = new Set();
  @Input() classId = "";
  message?: string;
  @Input() showSearchBox = false;
  @Input() showSuggestBox = false;
  @Input() isShowPassword = false;
  faEye = faEye;

  constructor(private api: TermIdsJobV1sApi, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(query => {
      this.showSuggestBox = Boolean(query["showSuggestBox"]);
      this.showSearchBox = Boolean(query["showSearchBox"]);
    });
  }

  onSubmit() {
    const timeToStart = new Date(this.timeToStart).getTime();
    const classIds = Array.from(this.classIds).map(x => x.trim()).filter(x => x);
    this.api.termIdSubmitCurrentNewJobV1(this.termId, this.username, this.password, classIds, timeToStart).subscribe();
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

  closeSearchBox() {
    this.showSearchBox = false;
  }

  openSearchBox() {
    this.showSearchBox = true;
  }

  closeSuggestBox() {
    this.showSuggestBox = false;
  }

  openSuggestBox() {
    this.showSuggestBox = true;
  }

  takeClickedClassToRegister(c: ClassToRegister) {
    if (c.classId) {
      this.classIds.add(String(c.classId));
    }
  }

  toggleShowPasswd() {
    this.isShowPassword = !this.isShowPassword;
  }
}
