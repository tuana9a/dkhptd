import { Component, OnInit } from "@angular/core";
import { TermIdsApi } from "src/apis/term-ids.api";

@Component({
  selector: "app-new-job-v1-page",
  templateUrl: "./new-job-v1-page.component.html",
  styleUrls: ["./new-job-v1-page.component.scss"]
})
export class NewJobV1PageComponent implements OnInit {
  termIds?: string[] = [];
  constructor(private api: TermIdsApi) { }

  ngOnInit(): void {
    this.api.all().subscribe(res => {
      if (res.success) {
        this.termIds = res.data;
      }
    });
  }
}
