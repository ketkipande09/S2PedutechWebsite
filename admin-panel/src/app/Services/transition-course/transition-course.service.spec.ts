import { TestBed } from '@angular/core/testing';

import { TransitionCourseService } from './transition-course.service';

describe('TransitionCourseService', () => {
  let service: TransitionCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransitionCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
