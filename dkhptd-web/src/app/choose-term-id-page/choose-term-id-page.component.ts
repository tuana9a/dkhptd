import { Component, OnInit } from "@angular/core";
import { TermIdsApi } from "src/apis/term-ids.api";

@Component({
  selector: "app-choose-term-id-page",
  templateUrl: "./choose-term-id-page.component.html",
  styleUrls: ["./choose-term-id-page.component.scss"]
})
export class ChooseTermIdPageComponent implements OnInit {
  termIds?: string[] = [];
  constructor(private api: TermIdsApi) { }

  ngOnInit(): void {
    this.api.all().subscribe(res => {
      if (res.success) {
        this.termIds = res.data?.map(x => x.name);
      }
    });
  }
}
