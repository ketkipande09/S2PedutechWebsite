import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningtoolsComponent } from './learningtools.component';

describe('LearningtoolsComponent', () => {
  let component: LearningtoolsComponent;
  let fixture: ComponentFixture<LearningtoolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LearningtoolsComponent]
    });
    fixture = TestBed.createComponent(LearningtoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
