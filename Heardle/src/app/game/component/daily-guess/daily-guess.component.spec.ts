import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyGuessComponent } from './daily-guess.component';

describe('DailyGuessComponent', () => {
  let component: DailyGuessComponent;
  let fixture: ComponentFixture<DailyGuessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyGuessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyGuessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
