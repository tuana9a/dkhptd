import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DkhptdJobLogsComponent } from "./dkhptd-job-logs.component";

describe("DkhptdJobLogsComponent", () => {
  let component: DkhptdJobLogsComponent;
  let fixture: ComponentFixture<DkhptdJobLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DkhptdJobLogsComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DkhptdJobLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
