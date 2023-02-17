import { Component, OnInit } from "@angular/core";
import { TermIdsApi } from "src/apis/term-ids.api";

@Component({
  selector: "app-manage-preference-page",
  templateUrl: "./manage-preference-page.component.html",
  styleUrls: ["./manage-preference-page.component.scss"]
})
export class ManagePreferencePageComponent implements OnInit {
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
