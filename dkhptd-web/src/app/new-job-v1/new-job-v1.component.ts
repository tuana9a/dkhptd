import { Component, OnInit } from "@angular/core";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";

@Component({
  selector: "app-new-job-v1",
  templateUrl: "./new-job-v1.component.html",
  styleUrls: ["./new-job-v1.component.scss"]
})
export class NewJobV1 implements OnInit {
  username = "";
  password = "";
  timeToStart = "";
  classIds = "";
  message?: string;

  constructor(private api: DKHPTDV1sApi) { }

  ngOnInit(): void {
    //
  }

  onSubmit() {
    const timeToStart = new Date(this.timeToStart).getTime();
    const classIds = this.classIds.trim().split(/,|\s+/).map(x => x.trim()).filter(x => x);
    this.api.submitCurrentNewJobV1(this.username, this.password, classIds, timeToStart).subscribe(res => {
      this.message = res.success ? "SUCCESS" : res.message;
    }, err => {
      this.message = err.message;
    });
  }
}
