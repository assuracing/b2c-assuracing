import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdaptiveTooltipComponent } from './adaptive-tooltip.component';

describe('AdaptiveTooltipComponent', () => {
  let component: AdaptiveTooltipComponent;
  let fixture: ComponentFixture<AdaptiveTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdaptiveTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdaptiveTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
