import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "app-upload-tkb-xlsx",
  templateUrl: "./upload-tkb-xlsx.component.html",
  styleUrls: ["./upload-tkb-xlsx.component.scss"]
})
export class UploadTkbXlsxComponent implements OnInit {
  secret = "";
  files: File[] = [];
  @ViewChild("input") input?: ElementRef<HTMLInputElement>;
  faMinus = faMinus;

  constructor(private api: ClassToRegsitersApi, private toast: ToastService) { }

  ngOnInit(): void {
    //
  }

  onSelectFile() {
    this.input?.nativeElement.click();
  }

  onFileSelected(e: any) {
    this.files = e.target.files;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const fileList = e.dataTransfer?.files;
    if (fileList) {
      const files: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList.item(i);
        if (f) {
          files.push(f);
        }
      }
      this.files = files;
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  upload() {
    if (this.files) {
      for (const file of this.files) {
        this.api.uploadTkbXlsx(this.secret, file).subscribe(res => this.toast.handleResponse(res));
      }
    }
  }

  fileNames() {
    return this.files.map(x => x.name);
  }

  removeSelectedFile(f: any) {
    this.files = this.files.filter(x => x != f);
  }
}
