import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import { ClassToRegister } from "src/entities";

@Component({
  selector: "[app-term-id-search-class-to-register]",
  templateUrl: "./term-id-search-class-to-register.component.html",
  styleUrls: ["./term-id-search-class-to-register.component.scss"]
})
export class TermIdSearchClassToRegisterComponent implements OnInit {
  @Input() showIdColumn = false;
  @Input() navigateOnQueryChange = true;
  @Input() showQueryKeys = true;
  @Input() q = "";
  @Input() termId = "";
  @Input() page = 0;
  @Input() size = 10;
  classes: ClassToRegister[] = [];
  @Input() showExample = false;
  @Input() searchOnInit = true;
  @Output() classClicked = new EventEmitter<ClassToRegister>();

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private api: ClassToRegsitersApi) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.termId = params["termId"];
      this.activatedRoute.queryParams.subscribe(query => {
        this.q = query["q"] || this.q || "";
        this.page = parseInt(query["page"]) || 0;
        this.size = parseInt(query["size"]) || 10;
        if (this.searchOnInit) {
          this.search();
        }
      });
    });
  }

  search() {
    const termId = this.termId;
    this.api.findClassesOfTermId(termId, this.q, this.page, this.size).subscribe(res => {
      if (res.success && termId == this.termId) {
        this.classes = res.data as ClassToRegister[];
      }
    });
  }

  onQueryChange() {
    this.size = Math.max(parseInt(this.size as unknown as string), 0);
    if (this.navigateOnQueryChange) {
      setTimeout(() => {
        this.router.navigate(["/search-class-to-register/term-ids", this.termId], {
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
    this.classClicked.emit(c);
  }
}
