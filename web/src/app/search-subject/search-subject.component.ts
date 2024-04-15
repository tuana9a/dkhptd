import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { faArrowLeftLong, faArrowRightLong, faCircleXmark, faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { SubjectsApi } from "src/apis/subjects.apis";
import { Subject } from "src/entities";
import { QueryTemplate, Q, parse, build } from "src/merin";

const opTranslate = new Map<string, string>();
opTranslate.set("==", ":");
opTranslate.set("*=", ":");

const queryTemplates = [
  { displayName: "Mã Học Phần", key: "subjectId", op: "==" },
  { displayName: "Tên Học Phần", key: "subjectName", op: "*=" },
];

@Component({
  selector: "[app-search-subject]",
  templateUrl: "./search-subject.component.html",
  styleUrls: ["./search-subject.component.scss"]
})
export class SearchSubjectComponent implements OnInit {
  @Input() showId = false;
  @Input() navigateOnQueryChange = false;
  @Input() showQueryKeys = false;
  @Input() q = "";
  @Input() page = 0;
  @Input() size = 10;
  subjects: Subject[] = [];
  @Input() showExample = false;
  @Input() searchOnInit = true;
  @Output() subjectClicked = new EventEmitter<Subject>();
  @Input() queryTemplates: QueryTemplate[] = queryTemplates;
  @Input() listQuery: Q[] = [];
  newQueryKey = "";
  newQueryValue = "";
  faCircleXmark = faCircleXmark;
  faMinus = faMinus;
  faXmark = faXmark;
  faArrowRight = faArrowRightLong;
  faArrowLeft = faArrowLeftLong;
  @Output() uncheckedEvent = new EventEmitter<Subject>();
  @Output() checkedEvent = new EventEmitter<Subject>();
  @Input() checkedSubjectIds: Set<string | undefined> = new Set();

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private api: SubjectsApi) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(query => {
      this.q = query["q"] || this.q || "";
      this.listQuery = this.q.split(",").map(x => parse(x)).filter(x => x.key);
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
        this.subjects = res.data as Subject[];
      }
    });
  }

  onQueryChange() {
    this.size = Math.max(parseInt(this.size as unknown as string), 0);
    if (this.navigateOnQueryChange) {
      setTimeout(() => {
        this.router.navigate(["/search-subject"], {
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

  onSubjectClickedEvent(c: Subject) {
    this.subjectClicked.emit(c);
  }

  onKeyPressOnNewQueryValue(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.addNewMatchQuery();
    }
  }

  addNewMatchQuery() {
    if (!this.newQueryKey || !this.newQueryValue) return;
    const queryTemplate = this.queryTemplates.find(x => x.key == this.newQueryKey);
    if (queryTemplate) {
      this.listQuery.push({ key: this.newQueryKey, value: this.newQueryValue, op: queryTemplate.op });
      this.q = build(this.listQuery);
      this.onQueryChange();
    }
  }

  removeQ(i: number) {
    this.listQuery.splice(i, 1);
    this.q = build(this.listQuery);
    this.onQueryChange();
  }

  keyTranslator(key: string) {
    return queryTemplates.find(x => x.key == key)?.displayName;
  }

  opTranslator(op: string) {
    return opTranslate.get(op);
  }

  onUnchecked(s: Subject) {
    this.uncheckedEvent.emit(s);
  }

  onChecked(s: Subject) {
    this.checkedEvent.emit(s);
  }
}
