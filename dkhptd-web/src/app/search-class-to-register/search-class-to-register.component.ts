import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import ClassToRegister from "src/entities/ClassToRegister";

@Component({
  selector: "[app-search-class-to-register]",
  templateUrl: "./search-class-to-register.component.html",
  styleUrls: ["./search-class-to-register.component.scss"]
})
export class SearchClassToRegisterComponent implements OnInit {
  @Input() showIdColumn = false;
  @Input() navigateOnQueryChange = true;
  @Input() q = "";
  @Input() page = 0;
  @Input() size = 10;
  classes: ClassToRegister[] = [];
  @Input() showExample = true;
  @Input() searchOnInit = true;
  @Output() classClickedEvent = new EventEmitter<ClassToRegister>();

  constructor(private route: ActivatedRoute, private router: Router, private api: ClassToRegsitersApi) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(query => {
      this.q = query["q"] || this.q || "";
      this.page = parseInt(query["page"]) || 0;
      this.size = parseInt(query["size"]) || 10;
      if (this.searchOnInit) {
        this.search();
      }
    });
  }

  search() {
    this.api.find(this.q, this.page, this.size).subscribe(res => {
      if (res.success) {
        this.classes = res.data as ClassToRegister[];
      }
    });
  }

  onQueryChange() {
    this.size = Math.max(parseInt(this.size as unknown as string), 0);
    if (this.navigateOnQueryChange) {
      setTimeout(() => {
        this.router.navigate(["/search-class-to-register"], {
          queryParams: {
            q: this.q,
            page: this.page,
            size: this.size,
          }
        });
      }, 0);
      return;
    }
    this.search();
  }

  nextPage() {
    this.page = parseInt(this.page as unknown as string) + 1;
    this.onQueryChange();
  }

  prevPage() {
    this.page = Math.max(parseInt(this.page as unknown as string) - 1, 0);
    this.onQueryChange();
  }

  onClassClickedEvent(c: ClassToRegister) {
    this.classClickedEvent.emit(c);
  }
}
