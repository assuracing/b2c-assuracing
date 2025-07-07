import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCoverageOptionsComponent } from './event-coverage-options.component';

describe('EventCoverageOptionsComponent', () => {
  let component: EventCoverageOptionsComponent;
  let fixture: ComponentFixture<EventCoverageOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCoverageOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCoverageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
