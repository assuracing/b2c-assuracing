import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorsLeagueComponent } from './motors-league.component';

describe('MotorsLeagueComponent', () => {
  let component: MotorsLeagueComponent;
  let fixture: ComponentFixture<MotorsLeagueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorsLeagueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorsLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
