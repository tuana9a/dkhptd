import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadTkbXlsxComponent } from "./upload-tkb-xlsx.component";

describe("UploadTkbXlsxComponent", () => {
  let component: UploadTkbXlsxComponent;
  let fixture: ComponentFixture<UploadTkbXlsxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadTkbXlsxComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UploadTkbXlsxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
