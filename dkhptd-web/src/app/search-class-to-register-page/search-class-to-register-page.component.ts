import { Component, OnInit } from "@angular/core";
import { TermIdsApi } from "src/apis/term-ids.api";

@Component({
  selector: "app-search-class-to-register-page",
  templateUrl: "./search-class-to-register-page.component.html",
  styleUrls: ["./search-class-to-register-page.component.scss"]
})
export class SearchClassToRegisterPageComponent implements OnInit {
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
