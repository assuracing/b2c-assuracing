import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteeChoiceComponent } from './guarantee-choice.component';

describe('GuaranteeChoiceComponent', () => {
  let component: GuaranteeChoiceComponent;
  let fixture: ComponentFixture<GuaranteeChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuaranteeChoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuaranteeChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
