import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContractsComponent } from './user-contracts.component';

describe('UserContractsComponent', () => {
  let component: UserContractsComponent;
  let fixture: ComponentFixture<UserContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserContractsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
