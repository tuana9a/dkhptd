import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "[app-term-id-search-class-to-register-page]",
  templateUrl: "./term-id-search-class-to-register-page.component.html",
  styleUrls: ["./term-id-search-class-to-register-page.component.scss"]
})
export class TermIdSearchClassToRegisterPageComponent implements OnInit {
  @Input() termId = "";
  constructor(private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.termId = params["termId"];
    });
  }
}
