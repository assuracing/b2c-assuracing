import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackdayComponent } from './trackday.component';

describe('TrackdayComponent', () => {
  let component: TrackdayComponent;
  let fixture: ComponentFixture<TrackdayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackdayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
