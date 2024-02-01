import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransitionCourseListComponent } from './transition-course-list.component';

describe('TransitionCourseListComponent', () => {
  let component: TransitionCourseListComponent;
  let fixture: ComponentFixture<TransitionCourseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransitionCourseListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransitionCourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
