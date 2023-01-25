import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClassToRegisterRowComponent } from "./class-to-register-row.component";

describe("ClassToRegisterRowComponent", () => {
  let component: ClassToRegisterRowComponent;
  let fixture: ComponentFixture<ClassToRegisterRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassToRegisterRowComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClassToRegisterRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
