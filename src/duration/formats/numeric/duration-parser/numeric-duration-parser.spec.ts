import { NumericDurationParser } from "./numeric-duration-parser";
import { Duration, inMinutes, toString } from "../../../duration";
import { DurationParser } from "../../../duration-parser";
import { NumericDurationPattern } from "../numeric-duration-pattern";

declare global {
  namespace jest {
    interface Matchers<R> {
      toDurationEqual(y: Duration): R;
    }
  }
}

expect.extend({
  toDurationEqual: (x: Duration, y: Duration) => {
    if (x?.inMicroseconds !== y?.inMicroseconds) {
      return {
        pass: false,
        message: () => `Recived ${toString(x)} but expected ${toString(y)}`
      }
    }
    
    return {
      pass: true,
      message: () => 'Recived duration ${toString(x)} equals to expected duration ${toString(y)}'
    };
  }
});

describe('NumericDurationParser', () => {
  
  const parser = new NumericDurationParser();
  
  function getDurationByDays(value: string) {
    return new Duration({
      minutes: +value * inMinutes(DurationParser.defaultWorkDayDuration)
    })
  }
  
  describe('workday duration should', () => {
  
    test('should parse duration string with number', () => {
      expect(parser.parse('2', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 }));
      expect(parser.parse('1 4:35', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 + 4, minutes: 35 }));
    });
  
    test('should parse one segment duration string with fraction', () => {
      expect(parser.parse('4.5', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 4 + 4 }));
      expect(parser.parse('4.50', NumericDurationPattern.day)).toDurationEqual(new Duration({hours: 8 * 4 + 4}));
      expect(parser.parse('4.55', NumericDurationPattern.day)).toDurationEqual(getDurationByDays('4.55'));
      expect(parser.parse('.5', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 4 }));
    });
  
    test('should parse duration string with fraction', () => {
      expect(parser.parse('.5 30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 4 + 30 }));
      expect(parser.parse('1.5 10min', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 + 4, minutes: 10 }));
      expect(parser.parse('0.5 1 30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 5, minutes: 30 }));
      expect(parser.parse('0.5d 1h 30m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 5, minutes: 30 }));
      expect(parser.parse('1 .5 30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 9 }));
      expect(parser.parse('1 0.5 30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 9 }));
      expect(parser.parse('1d 0.5h 30m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 9 }));
    });
  
    test('should parse duration with mixed pattern', () => {
      expect(parser.parse('0.5:30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1 }));
      expect(parser.parse('.5:30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1 }));
    });
  
    test('parse not full segment match', () => {
      expect(parser.parse('1d 8 20', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2, minutes: 20 }));
      expect(parser.parse('1 8h 20', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2, minutes: 20 }));
      expect(parser.parse('1 8 20m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2, minutes: 20 }));
      expect(parser.parse('1d 8', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 }));
      expect(parser.parse('1d 8', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 }));
      expect(parser.parse('1h 30', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1, minutes: 30 }));
      expect(parser.parse('1 30m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8, minutes: 30 }));
    });
  
    test('parse duration string with one segment', () => {
      expect(parser.parse('1d', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 }));
      expect(parser.parse('2 d', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 }));
      expect(parser.parse('6h', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 6 }));
      expect(parser.parse('2 h', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 2 }));
      expect(parser.parse('3m', NumericDurationPattern.day)).toDurationEqual(new Duration({ minutes: 3 }));
      expect(parser.parse('5 m', NumericDurationPattern.day)).toDurationEqual(new Duration({ minutes: 5 }));
    });
  
    test('parse duration string with two segments', () => {
      expect(parser.parse('1d 5h', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 + 5 }));
      expect(parser.parse('1d 3m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8, minutes: 3 }));
      expect(parser.parse('2h50m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 2, minutes: 50 }));
    });
  
    test('parse duration string with three segments', () => {
      expect(parser.parse('2d 4h 10m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 + 4, minutes: 10 }));
      expect(parser.parse('10m4h2d', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 + 4, minutes: 10 }));
    });
  
    test('parse duration string with long segment names', () => {
      expect(parser.parse('1 day', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 }));
      expect(parser.parse('2days', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 2 }));
    
      expect(parser.parse('1 hour', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1 }));
      expect(parser.parse('4hours', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 4 }));
    
      expect(parser.parse('1 minute', NumericDurationPattern.day)).toDurationEqual(new Duration({ minutes: 1 }));
      expect(parser.parse('10minutes', NumericDurationPattern.day)).toDurationEqual(new Duration({ minutes: 10 }));
    
      expect(parser.parse('1day 4hours', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 12 }));
      expect(parser.parse('1hour 30minutes', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1, minutes: 30 }));
    
      expect(parser.parse('1hour 30m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1, minutes: 30 }));
      expect(parser.parse('1h 30minutes', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1, minutes: 30 }));
    });
  
    test('parse duration string with leading and trailing white-space', () => {
      expect(parser.parse(' 2d 4h 10m\t', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 20, minutes: 10 }));
    });
  
    test('parse duration string with punctuation marks', () => {
      expect(parser.parse('3d, 4h, 10m', NumericDurationPattern.day)).toEqual(null);
    });
  
    test('summarize segments if there are duplicates', () => {
      expect(parser.parse('1h 3h', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 4 }));
      expect(parser.parse('1d 3d', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 4 }));
      expect(parser.parse('1d 2m 3d', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 8 * 4, minutes: 2 }));
      expect(parser.parse('2h 1m 10m', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 2, minutes: 11 }));
    });
  
    test('reject invalid segments', () => {
      expect(parser.parse('1k 2m', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('1/5', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('4.ghhghg1', NumericDurationPattern.day)).toEqual(null);
    });
  
    test('reject not full segment match', () => {
      expect(parser.parse('1h ab 1d', NumericDurationPattern.day)).toEqual(null);
    });
  
    test('reject not much on pattern', () => {
      expect(parser.parse('1 8 20 11', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('4.5.6', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('0..5', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('0.5m', NumericDurationPattern.day)).toEqual(null);
      expect(parser.parse('0.5nnn', NumericDurationPattern.day)).toEqual(null);
    });
  
    test('accuracy', () => {
      expect(parser.parse('0.1', NumericDurationPattern.day)).toDurationEqual(new Duration({ minutes: 48 }));
      expect(parser.parse('0.2', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 1, minutes: 36 }));
      expect(parser.parse('0.3', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 2, minutes: 24 }));
      expect(parser.parse('0.4', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 3, minutes: 12 }));
      expect(parser.parse('4:1.5', NumericDurationPattern.day)).toDurationEqual(new Duration({ hours: 4 }));
    });
  });
  
  describe('time duration', () => {
    test('should parse duration string with only number', () => {
      expect(parser.parse('2', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 2 }));
    });
    
    test('should parse duration string with two segments', () => {
      expect(parser.parse('2h 50m', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 2, minutes: 50 }));
    });
    
    test('should parse duration string with leading and trailing white-space', () => {
      expect(parser.parse(' 4h 10m\t', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 4, minutes: 10 }));
    });
    
    test('parse not full segment match', () => {
      expect(parser.parse('8h 20', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 8, minutes: 20 }));
      expect(parser.parse('8 20m', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 8, minutes: 20 }));
      expect(parser.parse('1d 1 30', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 9, minutes: 30 }));
      expect(parser.parse('1 1h 30', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 2, minutes: 30 }));
    });
    
    test('summarize segments if there are duplicates', () => {
      expect(parser.parse('1d 3d', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 32 }));
      expect(parser.parse('1h 3h', NumericDurationPattern.hour)).toDurationEqual(new Duration({ hours: 4 }));
      expect(parser.parse('1m 10m', NumericDurationPattern.hour)).toDurationEqual(new Duration({ minutes: 11 }));
    });
    
    test('accuracy', () => {
      expect(parser.parse('0.1', NumericDurationPattern.hour)).toDurationEqual(new Duration({ minutes: 6 }));
      expect(parser.parse('0.2', NumericDurationPattern.hour)).toDurationEqual(new Duration({ minutes: 12 }));
      expect(parser.parse('0.3', NumericDurationPattern.hour)).toDurationEqual(new Duration({ minutes: 18 }));
      expect(parser.parse('0.4', NumericDurationPattern.hour)).toDurationEqual(new Duration({ minutes: 24 }));
    });
    
    test('reject not full segment match', () => {
      expect(parser.parse('1h m', NumericDurationPattern.hour)).toEqual(null);
      expect(parser.parse('10h,. 15m', NumericDurationPattern.hour)).toEqual(null);
      expect(parser.parse('0.5m', NumericDurationPattern.hour)).toEqual(null);
      expect(parser.parse('0.5nnn', NumericDurationPattern.hour)).toEqual(null);
    });
  });
});

