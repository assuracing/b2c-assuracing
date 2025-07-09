import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfilInfoComponent } from './user-profil-info.component';

describe('UserProfilInfoComponent', () => {
  let component: UserProfilInfoComponent;
  let fixture: ComponentFixture<UserProfilInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfilInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfilInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
