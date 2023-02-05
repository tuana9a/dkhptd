import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import { ClassToRegister } from "src/entities";
import { Q, MatchQueryTemplate, build, parse } from "src/merin";
import { faCircleXmark, faMinus, faXmark, faArrowRightLong, faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "[app-term-id-search-class-to-register]",
  templateUrl: "./term-id-search-class-to-register.component.html",
  styleUrls: ["./term-id-search-class-to-register.component.scss"]
})
export class TermIdSearchClassToRegisterComponent implements OnInit {
  @Input() showIdColumn = false;
  @Input() navigateOnQueryChange = true;
  @Input() showQueryKeys = false;
  @Input() q = "";
  @Input() termId = "";
  @Input() page = 0;
  @Input() size = 10;
  classes: ClassToRegister[] = [];
  @Input() showExample = false;
  @Input() searchOnInit = true;
  @Output() classClicked = new EventEmitter<ClassToRegister>();
  @Input() matchQueryTemplates: MatchQueryTemplate[] = [];
  @Input() listQuery: Q[] = [];
  newQueryKey = "";
  newQueryValue = "";
  keyTranslate = new Map<string, string>();
  faCircleXmark = faCircleXmark;
  faMinus = faMinus;
  faXmark = faXmark;
  faArrowRight = faArrowRightLong;
  faArrowLeft = faArrowLeftLong;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private api: ClassToRegsitersApi) {
    this.matchQueryTemplates = [
      { displayName: "Mã Lớp", key: "classId" },
      { displayName: "Mã Lớp Kèm", key: "secondClassId" },
      { displayName: "Mã Học Phần", key: "subjectId" },
      { displayName: "Thời Gian Học", key: "learnTime" }
    ];
    this.newQueryKey = this.matchQueryTemplates[0].key;
    this.keyTranslate.set("classId", "Mã Lớp");
    this.keyTranslate.set("secondClassId", "Mã Lớp Kèm");
    this.keyTranslate.set("subjectId", "Mã Học Phần");
    this.keyTranslate.set("termId", "Kỳ Học");
    this.keyTranslate.set("learnTime", "Thời gian học");
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.termId = params["termId"];
      this.activatedRoute.queryParams.subscribe(query => {
        this.q = query["q"] || this.q || "";
        this.listQuery = this.q.split(",").map(x => parse(x)).filter(x => x.key);
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
      return setTimeout(() => {
        this.router.navigate(["/term-ids", this.termId, "search-class-to-register"], {
          queryParams: {
            q: this.q,
            page: this.page,
            size: this.size,
          }
        });
      }, 0);
    }
    return this.search();
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

  onKeyPressOnNewQueryValue(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.addNewMatchQuery();
    }
  }

  addNewMatchQuery() {
    if (!this.newQueryKey || !this.newQueryValue) return;
    this.listQuery.push({ key: this.newQueryKey, value: this.newQueryValue, op: "==" });
    this.q = build(this.listQuery);
    this.onQueryChange();
  }

  removeQ(i: number) {
    this.listQuery.splice(i, 1);
    this.q = build(this.listQuery);
    this.onQueryChange();
  }
}
