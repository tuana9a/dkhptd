import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchClassToRegisterComponent } from "./search-class-to-register.component";

describe("WorkerManagerComponent", () => {
  let component: SearchClassToRegisterComponent;
  let fixture: ComponentFixture<SearchClassToRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchClassToRegisterComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SearchClassToRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
