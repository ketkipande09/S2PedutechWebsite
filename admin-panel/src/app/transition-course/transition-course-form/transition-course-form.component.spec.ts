import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionCourseFormComponent } from './transition-course-form.component';

describe('TransitionCourseFormComponent', () => {
  let component: TransitionCourseFormComponent;
  let fixture: ComponentFixture<TransitionCourseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransitionCourseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransitionCourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
