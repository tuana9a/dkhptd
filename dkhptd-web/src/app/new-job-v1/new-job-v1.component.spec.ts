import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewJobV1 } from "./new-job-v1.component";

describe("WorkerStatusPingComponent", () => {
  let component: NewJobV1;
  let fixture: ComponentFixture<NewJobV1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewJobV1 ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewJobV1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
