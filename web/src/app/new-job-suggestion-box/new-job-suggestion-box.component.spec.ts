import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewJobSuggestionBoxComponent } from "./new-job-suggestion-box.component";

describe("NewJobSuggestionBoxComponent", () => {
  let component: NewJobSuggestionBoxComponent;
  let fixture: ComponentFixture<NewJobSuggestionBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewJobSuggestionBoxComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewJobSuggestionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
