import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "app-new-job-v1-for-term-id",
  templateUrl: "./new-job-v1-for-term-id.component.html",
  styleUrls: ["./new-job-v1-for-term-id.component.scss"]
})
export class NewJobV1ForTermIdComponent implements OnInit {
  @Input() termId = "";
  @Input() classIds: Set<string>;
  @Input() hideSearchBox = true;
  constructor(private activatedRoute: ActivatedRoute) {
    this.classIds = new Set();
  }

  closeSearchBox() {
    this.hideSearchBox = true;
  }

  openSearchBox() {
    this.hideSearchBox = false;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const termId = params["termId"];
      this.termId = termId;
    });
  }

  takeClickedClassToRegister(c: ClassToRegister) {
    if (c.classId) {
      this.classIds.add(String(c.classId));
    }
  }
}
