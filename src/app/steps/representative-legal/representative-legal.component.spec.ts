import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepresentativeLegalComponent } from './representative-legal.component';

describe('RepresentativeLegalComponent', () => {
  let component: RepresentativeLegalComponent;
  let fixture: ComponentFixture<RepresentativeLegalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepresentativeLegalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepresentativeLegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
