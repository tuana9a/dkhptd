import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DkhptdJobV1ResultPageComponent } from "./dkhptd-job-v1-result-page.component";

describe("DkhptdJobV1ResultPageComponent", () => {
  let component: DkhptdJobV1ResultPageComponent;
  let fixture: ComponentFixture<DkhptdJobV1ResultPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DkhptdJobV1ResultPageComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DkhptdJobV1ResultPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
