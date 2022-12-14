import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageDKHPTDJOBV1Component } from "./manage-dkhptd-job-v1.component";

describe("ManageDKHPTDJOBV1Component", () => {
  let component: ManageDKHPTDJOBV1Component;
  let fixture: ComponentFixture<ManageDKHPTDJOBV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageDKHPTDJOBV1Component ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageDKHPTDJOBV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
