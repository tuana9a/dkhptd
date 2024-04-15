import { ComponentFixture, TestBed } from "@angular/core/testing";

import { JobV1ResultPageComponent } from "./job-v1-result-page.component";

describe("JobV1ResultPageComponent", () => {
  let component: JobV1ResultPageComponent;
  let fixture: ComponentFixture<JobV1ResultPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobV1ResultPageComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(JobV1ResultPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
