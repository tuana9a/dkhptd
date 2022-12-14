import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DkhptdJobComponent } from "./dkhptd-job.component";

describe("DkhptdJobDetailComponent", () => {
  let component: DkhptdJobComponent;
  let fixture: ComponentFixture<DkhptdJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DkhptdJobComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DkhptdJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
