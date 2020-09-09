import { NumericDurationFormatter } from "./numeric-duration-formatter";
import { NumericDurationPattern } from "../numeric-duration-pattern";
import { Duration } from "../../../duration";

const formatter = new NumericDurationFormatter();

describe('numeric duration formatter tests', () => {
  test('should format empty duration', () => {
    expect(formatter.format(null, NumericDurationPattern.hour)).toEqual('');
  });
  
  test('should throw on empty pattern', () => {
    expect(() => formatter.format(formatter.coerce(Duration.zero), null)).toThrowError();
  });
  
  test('should format duration in minutes in time format', () => {
    // act & assert
    expect(formatter.format(null, NumericDurationPattern.hour)).toEqual('');
    expect(formatter.format(10, NumericDurationPattern.hour)).toEqual('10m');
    expect(formatter.format(60, NumericDurationPattern.hour)).toEqual('1h');
    expect(formatter.format(75, NumericDurationPattern.hour)).toEqual('1h 15m');
    expect(formatter.format(620, NumericDurationPattern.hour)).toEqual('10h 20m');
    expect(formatter.format(6005, NumericDurationPattern.hour)).toEqual('100h 5m');
  });
  
  test('should format duration in minutes in workday format with custom workDay duration', () => {
    // act & assert
    const workDayDuration = 6;
    expect(formatter.format(620, NumericDurationPattern.hour, new Duration({ hours: workDayDuration }))).toEqual('10h 20m');
    expect(formatter.format(6005, NumericDurationPattern.hour, new Duration({ hours: workDayDuration }))).toEqual('100h 5m');
  });
  
  test('should format duration in minutes in workday format', () => {
    // act & assert
    expect(formatter.format(null, NumericDurationPattern.day)).toEqual('');
    expect(formatter.format(10, NumericDurationPattern.day)).toEqual('10m');
    expect(formatter.format(60, NumericDurationPattern.day)).toEqual('1h');
    expect(formatter.format(75, NumericDurationPattern.day)).toEqual('1h 15m');
    expect(formatter.format(620, NumericDurationPattern.day)).toEqual('1d 2h 20m');
    expect(formatter.format(6005, NumericDurationPattern.day)).toEqual('12d 4h 5m');
  });
  
  test('should format duration in minutes in workday format with custom workDay duration', () => {
    // act & assert
    const workDayDuration = 6;
    expect(
      formatter.format(620, NumericDurationPattern.day, new Duration({ hours: workDayDuration }))).toEqual('1d 4h 20m');
    expect(
      formatter.format(6005, NumericDurationPattern.day, new Duration({ hours: workDayDuration }))).toEqual('16d 4h 5m');
  });
  
  test('should export duration to hours', () => {
    // act & assert
    expect(formatter.export(null)).toEqual(null);
    expect(formatter.export(Duration.minutesPerDay)).toEqual('1');
  });
  
  test('should coerce duration to minutes', () => {
    // act & assert
    expect(formatter.coerce(null)).toEqual(null);
    expect(formatter.coerce(new Duration({ minutes: 10 }))).toEqual(10);
    expect(formatter.coerce(new Duration({ hours: 1, minutes: 15 }))).toEqual(75);
    expect(formatter.coerce(new Duration({ hours: 10, minutes: 20 }))).toEqual(10 * 60 + 20);
    expect(formatter.coerce(new Duration({ days: 1 }))).toEqual(24 * 60);
  });
});
