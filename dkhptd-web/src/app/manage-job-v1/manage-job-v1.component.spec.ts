import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageJobV1Component } from "./manage-job-v1.component";

describe("ManageDKHPTDJOBV1Component", () => {
  let component: ManageJobV1Component;
  let fixture: ComponentFixture<ManageJobV1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageJobV1Component ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageJobV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
