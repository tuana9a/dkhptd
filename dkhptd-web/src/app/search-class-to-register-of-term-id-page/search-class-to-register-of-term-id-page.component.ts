import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "[app-search-class-to-register-of-term-id-page]",
  templateUrl: "./search-class-to-register-of-term-id-page.component.html",
  styleUrls: ["./search-class-to-register-of-term-id-page.component.scss"]
})
export class SearchClassToRegisterOfTermIdPageComponent implements OnInit {
  @Input() termId = "";
  constructor(private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.termId = params["termId"];
    });
  }
}
