import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCoverageComponent } from './event-coverage.component';

describe('EventCoverageComponent', () => {
  let component: EventCoverageComponent;
  let fixture: ComponentFixture<EventCoverageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCoverageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
