import { Component, OnInit } from "@angular/core";
import { TermIdsApi } from "src/apis/term-ids.api";

@Component({
  selector: "app-manage-job-v1-by-term-ids",
  templateUrl: "./manage-job-v1-by-term-ids.component.html",
  styleUrls: ["./manage-job-v1-by-term-ids.component.scss"]
})
export class ManageJobV1ByTermIdsComponent implements OnInit {
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
