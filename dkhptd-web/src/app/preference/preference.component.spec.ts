import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PreferenceComponent } from "./preference.component";

describe("WorkerStatusComponent", () => {
  let component: PreferenceComponent;
  let fixture: ComponentFixture<PreferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferenceComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
