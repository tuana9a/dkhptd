import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WorkerStatusDoingComponent } from "./worker-status-doing.component";

describe("WorkerStatusDoingComponent", () => {
  let component: WorkerStatusDoingComponent;
  let fixture: ComponentFixture<WorkerStatusDoingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerStatusDoingComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WorkerStatusDoingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
