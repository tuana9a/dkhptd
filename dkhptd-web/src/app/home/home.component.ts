import { Component, OnInit } from "@angular/core";
import { PublicApi } from "src/apis/public.api";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {

  constructor(private publicApi: PublicApi) { }

  ngOnInit(): void {
    //
  }
}
