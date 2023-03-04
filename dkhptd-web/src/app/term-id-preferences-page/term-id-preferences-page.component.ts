import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference } from "src/entities";

@Component({
  selector: "app-term-id-preferences-page",
  templateUrl: "./term-id-preferences-page.component.html",
  styleUrls: ["./term-id-preferences-page.component.scss"]
})
export class TermIdPreferencesPageComponent implements OnInit {
  @Input() termId = "";
  @Input() preferences: AccountPreference[] = [];
  constructor(private activatedRoute: ActivatedRoute, private api: AccountsApi) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const termId = params["termId"];
      this.termId = termId;
      this.api.currentPreferencesOfTermId(termId).subscribe(res => {
        if (res.success) {
          if (this.termId == termId) {
            if (res.data) {
              this.preferences = res.data;
            }
          }
        }
      });
    });
  }
}
