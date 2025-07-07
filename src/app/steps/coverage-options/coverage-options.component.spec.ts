import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageOptionsComponent } from './coverage-options.component';

describe('CoverageOptionsComponent', () => {
  let component: CoverageOptionsComponent;
  let fixture: ComponentFixture<CoverageOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverageOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
