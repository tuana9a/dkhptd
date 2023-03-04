import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AccountsApi } from "src/apis/accounts.api";
import { AccountPreference } from "src/entities";

@Component({
  selector: "app-term-id-preference-page",
  templateUrl: "./term-id-preference-page.component.html",
  styleUrls: ["./term-id-preference-page.component.scss"]
})
export class TermIdPreferencePageComponent implements OnInit {
  @Input() termId = "";
  @Input() preference: AccountPreference = new AccountPreference({ termId: "", wantedSubjectIds: [] });
  constructor(private activatedRoute: ActivatedRoute, private api: AccountsApi) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const termId = params["termId"];
      this.termId = termId;
      this.preference.termId = termId;
      this.init();
    });
  }

  init() {
    const termId = this.termId;
    this.api.currentPreferencesOfTermId(termId).subscribe(res => {
      if (res.success) {
        if (this.termId == termId) {
          if (res.data) {
            console.log(res.data.length);
            if (res.data.length == 0) {
              this.api.addPreference(this.preference).subscribe(() => {
                this.fetchAllGetFirst();
              });
            } else if (res.data.length > 1) {
              for (const p of res.data) {
                if (p._id) {
                  this.api.deletePreference(p._id).subscribe(() => {
                    this.init();
                  });
                }
              }
            } else {
              this.preference = res.data[0];
            }
          }
        }
      }
    });
  }

  fetchAllGetFirst() {
    const termId = this.termId;
    this.api.currentPreferencesOfTermId(termId).subscribe(res => {
      if (res.success) {
        if (this.termId == termId) {
          if (res.data) {
            this.preference = res.data[0];
          }
        }
      }
    });
  }
}
