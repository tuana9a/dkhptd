import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DkhptdJobRowComponent } from './dkhptd-job-row.component';

describe('DkhptdJobRowComponent', () => {
  let component: DkhptdJobRowComponent;
  let fixture: ComponentFixture<DkhptdJobRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DkhptdJobRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DkhptdJobRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
