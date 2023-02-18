import { Component, Input, OnInit } from "@angular/core";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { TermIdsApi } from "src/apis/term-ids.api";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "[app-manage-term-id]",
  templateUrl: "./manage-term-id.component.html",
  styleUrls: ["./manage-term-id.component.scss"]
})
export class ManageTermIdComponent implements OnInit {
  termIds?: string[] = [];
  faPlus = faPlus;
  faMinus = faMinus;
  @Input() showUpdateButton = true;
  @Input() showIdColumn = true;
  termId = "";
  constructor(private termIdsApi: TermIdsApi, private toast: ToastService) { }

  ngOnInit(): void {
    this.termIdsApi.all().subscribe(res => {
      this.termIds = res.data;
    });
  }

  onAddTermId() {
    if (this.termId && !this.termId.match(/^\s*$/)) {
      this.termIds?.push(this.termId);
    }
  }

  onRemoveTermId(termId: string) {
    this.termIds = this.termIds?.filter(x => x != termId);
  }

  onUpsert() {
    if (this.termIds) this.termIdsApi.replace(this.termIds).subscribe(res => this.toast.handleResponse(res));
  }

  onKeyPressTermId(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.onAddTermId();
    }
  }
}
