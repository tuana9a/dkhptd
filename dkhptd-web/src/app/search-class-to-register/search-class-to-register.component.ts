import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "app-search-class-to-register",
  templateUrl: "./search-class-to-register.component.html",
  styleUrls: ["./search-class-to-register.component.scss"]
})
export class SearchClassToRegisterComponent implements OnInit {
  @Input() showIdColumn = false;
  q = "";
  page = 0;
  size = 10;
  classToRegsiters: ClassToRegister[] = [];
  constructor(private route: ActivatedRoute, private router: Router, private api: ClassToRegsitersApi) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      this.q = query["q"] || "";
      this.page = query["page"] || 0;
      this.size = query["size"] || 10;
      this.api.find(this.q, this.page, this.size).subscribe(res => {
        if (res.success) {
          this.classToRegsiters = res.data as ClassToRegister[];
        }
      });
    });
  }

  onQueryChange() {
    setTimeout(() => {
      this.router.navigate(["/search-class-to-register"], {
        queryParams: {
          q: this.q,
          page: this.page,
          size: this.size,
        }
      });
    }, 0);
  }

  nextPage() {
    this.page = parseInt(this.page as unknown as string) + 1;
    this.onQueryChange();
  }

  prevPage() {
    this.page = Math.max(parseInt(this.page as unknown as string) - 1, 0);
    this.onQueryChange();
  }
}
