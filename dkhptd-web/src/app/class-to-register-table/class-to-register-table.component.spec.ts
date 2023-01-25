import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClassToRegisterTableComponent } from "./class-to-register-table.component";

describe("ClassToRegisterTableComponent", () => {
  let component: ClassToRegisterTableComponent;
  let fixture: ComponentFixture<ClassToRegisterTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassToRegisterTableComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClassToRegisterTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
