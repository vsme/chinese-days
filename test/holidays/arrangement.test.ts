import dayjs from 'dayjs';
import { Arrangement, Holiday } from '../../src';

describe('Arrangement class', () => {
  let arrangement: Arrangement;

  beforeEach(() => {
    arrangement = new Arrangement();
  });

  it('should set year correctly', () => {
    arrangement.yearAt(2024);
    expect((arrangement as any).dayDetails.year).toBe(2024);
  });

  it('should mark holiday correctly', () => {
    arrangement.nyd();
    expect((arrangement as any).dayDetails.holiday).toBe(Holiday.NewYearsDay);
  });

  it('should save holiday correctly', () => {
    arrangement.yearAt(2024).nyd().rest(1, 1);
    const date = dayjs('2024-01-01').format('YYYY-MM-DD');
    expect(arrangement.holidays[date]).toBe(Holiday.NewYearsDay);
  });

  it('should save workday correctly', () => {
    arrangement.yearAt(2024).sf().work(2, 4);
    const date = dayjs('2024-02-04').format('YYYY-MM-DD');
    expect(arrangement.workdays[date]).toBe(Holiday.SpringFestival);
  });

  it('should save in-lieu day correctly', () => {
    arrangement.yearAt(2024).maf().inLieu(9, 16);
    const date = dayjs('2024-09-16').format('YYYY-MM-DD');
    expect(arrangement.inLieuDays[date]).toBe(Holiday.MidAutumnFestival);
  });

  it('should save holiday range correctly', () => {
    arrangement.yearAt(2024).sf().rest(2, 10).to(2, 12);
    const dates = ['2024-02-10', '2024-02-11', '2024-02-12'].map(date =>
      dayjs(date).format('YYYY-MM-DD')
    );
    dates.forEach(date => {
      expect(arrangement.holidays[date]).toBe(Holiday.SpringFestival);
    });
  });

  it('should throw error if year is not set before saving holiday', () => {
    expect(() => arrangement.nyd().rest(1, 1)).toThrow(
      'should set year before saving holiday'
    );
  });

  it('should throw error if holiday is not set before saving holiday', () => {
    expect(() => arrangement.yearAt(2024).rest(1, 1)).toThrow(
      'should set holiday before saving holiday'
    );
  });

  it('should throw error if end date is before start date in holiday range', () => {
    arrangement.yearAt(2024).sf().rest(2, 10);
    expect(() => arrangement.to(2, 9)).toThrow('end date should be after start date');
  });

  it('should throw error if year/month/day is not set before saving holiday range', () => {
    expect(() => arrangement.to(2, 10)).toThrow(
      'should set year/month/day before saving holiday range'
    );
  });
});
