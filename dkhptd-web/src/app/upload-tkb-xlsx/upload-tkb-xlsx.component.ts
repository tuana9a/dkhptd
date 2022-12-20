import { Component, OnInit } from "@angular/core";
import { ClassToRegsitersApi } from "src/apis/class-to-register.apis";

@Component({
  selector: "app-upload-tkb-xlsx",
  templateUrl: "./upload-tkb-xlsx.component.html",
  styleUrls: ["./upload-tkb-xlsx.component.scss"]
})
export class UploadTkbXlsxComponent implements OnInit {
  secret = "";
  file?: File;

  constructor(private api: ClassToRegsitersApi) { }

  ngOnInit(): void {
    //
  }

  onFileSelected(e: any) {
    this.file = e.target.files[0];
    console.log(this.file);
  }

  upload() {
    if (this.file) {
      this.api.uploadTkbXlsx(this.secret, this.file).subscribe(res => {
        console.log(res);
      });
    }
  }
}
