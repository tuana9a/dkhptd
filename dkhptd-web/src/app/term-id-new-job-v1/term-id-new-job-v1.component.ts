import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "app-term-id-new-job-v1",
  templateUrl: "./term-id-new-job-v1.component.html",
  styleUrls: ["./term-id-new-job-v1.component.scss"]
})
export class TermIdNewJobV1Component implements OnInit {
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
