import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyGuaranteeComponent } from './yearly-guarantee.component';

describe('YearlyGuaranteeComponent', () => {
  let component: YearlyGuaranteeComponent;
  let fixture: ComponentFixture<YearlyGuaranteeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlyGuaranteeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlyGuaranteeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
