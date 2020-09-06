import { NumericDurationPreprocessor } from "./numeric-duration-preprocessor";
import { NumericDurationPattern } from "../numeric-duration-pattern";

describe('NumericDurationPreprocessor should on', () => {
  
  const preprocessor = new NumericDurationPreprocessor();
  
  describe('compact hours format', () => {
  
    test('preprocess short form X:Y to Xh Ym', () => {
      expect(preprocessor.preprocessCompactHours(':2')).toEqual('2m');
      expect(preprocessor.preprocessCompactHours(' 2: ')).toEqual(' 2h');
      expect(preprocessor.preprocessCompactHours('2 : 30')).toEqual('2h30');
    });
  
    test('save part with non short hours format', () => {
      expect(preprocessor.preprocessCompactHours('5d 2:30')).toEqual('5d 2h30m');
      expect(preprocessor.preprocessCompactHours('5.5 2:30')).toEqual('5.5 2h30m');
      expect(preprocessor.preprocessCompactHours('1 2:30')).toEqual('1 2h30m');
    });
    
    test('reject string with mistake', () => {
      expect(preprocessor.preprocessCompactHours('2:30:10:10')).toEqual('');
      expect(preprocessor.preprocessCompactHours('2:30:10')).toEqual('');
    });

    test('process with fraction', () => {
      expect(preprocessor.preprocessCompactHours('0.5:30')).toEqual('0.5h30m');
      expect(preprocessor.preprocessCompactHours('1:0.5')).toEqual('1h0.5m');
    });
  });
  
  describe('fraction format', () => {
    test('preprocess segment in workdays', () => {
      expect(preprocessor.preprocessFraction('1.', NumericDurationPattern.day)).toEqual('1d');
      expect(preprocessor.preprocessFraction('1.5', NumericDurationPattern.day)).toEqual('1d 4h');
      expect(preprocessor.preprocessFraction('.5', NumericDurationPattern.day)).toEqual('4h');
    });

    test('preprocess segment in workdays with word', () => {
      expect(preprocessor.preprocessFraction('1.d', NumericDurationPattern.day)).toEqual('1d');
      expect(preprocessor.preprocessFraction('4.5d', NumericDurationPattern.day)).toEqual('4d 4h');
      expect(preprocessor.preprocessFraction('1.5hour', NumericDurationPattern.day)).toEqual('1h 30m');
      expect(preprocessor.preprocessFraction('.5hours', NumericDurationPattern.day)).toEqual('30m');
      expect(preprocessor.preprocessFraction('1.4h', NumericDurationPattern.day)).toEqual('1h 24m');
    });
  
    test('preprocess segment in time', () => {
      expect(preprocessor.preprocessFraction('1.', NumericDurationPattern.hour)).toEqual('1h');
      expect(preprocessor.preprocessFraction('1.5', NumericDurationPattern.hour)).toEqual('1h 30m');
      expect(preprocessor.preprocessFraction('.5', NumericDurationPattern.hour)).toEqual('30m');
    });

    test('save part without fraction', () => {
      expect(preprocessor.preprocessFraction('20d', NumericDurationPattern.day)).toEqual('20d');
      expect(preprocessor.preprocessFraction('20d 1.5', NumericDurationPattern.day)).toEqual('20d1d 4h');
      expect(preprocessor.preprocessFraction('1.5 10min', NumericDurationPattern.day)).toEqual('1d 4h10min');
      expect(preprocessor.preprocessFraction('1. 10m', NumericDurationPattern.day)).toEqual('1d10m');
      expect(preprocessor.preprocessFraction('0.5d 4h 30m', NumericDurationPattern.day)).toEqual('4h 4h 30m');
    });
  
    test('preprocess segment in time with word', () => {
      expect(preprocessor.preprocessFraction('1d.', NumericDurationPattern.hour)).toEqual('1d');
      expect(preprocessor.preprocessFraction('1.5day', NumericDurationPattern.hour)).toEqual('12h');
      expect(preprocessor.preprocessFraction('.5hours', NumericDurationPattern.hour)).toEqual('30m');
      expect(preprocessor.preprocessFraction('3.4h', NumericDurationPattern.hour)).toEqual('3h 24m');
    });
  
    test('with accuracy', () => {
      expect(preprocessor.preprocessFraction('0.1', NumericDurationPattern.hour)).toEqual('6m');
      expect(preprocessor.preprocessFraction('0.2', NumericDurationPattern.hour)).toEqual('12m');
      expect(preprocessor.preprocessFraction('0.3', NumericDurationPattern.hour)).toEqual('18m');
      expect(preprocessor.preprocessFraction('0.4', NumericDurationPattern.hour)).toEqual('24m');
    });
  
    test('two digits after comma', () => {
      expect(preprocessor.preprocessFraction('0.25', NumericDurationPattern.hour)).toEqual('15m');
      expect(preprocessor.preprocessFraction('0.251', NumericDurationPattern.hour)).toEqual('15m');
      expect(preprocessor.preprocessFraction('0.256', NumericDurationPattern.hour)).toEqual('16m');
      expect(preprocessor.preprocessFraction('0.01', NumericDurationPattern.hour)).toEqual('1m');
    });
  
    test('with accuracy (workday format)', () => {
      expect(preprocessor.preprocessFraction('0.1', NumericDurationPattern.day)).toEqual('48m');
      expect(preprocessor.preprocessFraction('0.2', NumericDurationPattern.day)).toEqual('1h 36m');
      expect(preprocessor.preprocessFraction('0.3', NumericDurationPattern.day)).toEqual('2h 24m');
      expect(preprocessor.preprocessFraction('0.4', NumericDurationPattern.day)).toEqual('3h 12m');
    });
  
    test('two digits after comma (workday format)', () => {
      expect(preprocessor.preprocessFraction('0.25', NumericDurationPattern.day)).toEqual('2h');
      expect(preprocessor.preprocessFraction('0.251', NumericDurationPattern.day)).toEqual('2h');
      expect(preprocessor.preprocessFraction('0.256', NumericDurationPattern.day)).toEqual('2h 5m');
    });
  
    test('reject string with mistake', () => {
      expect(preprocessor.preprocessFraction('1.3m', NumericDurationPattern.day)).toEqual('');
      expect(preprocessor.preprocessFraction('1.3nmnm', NumericDurationPattern.day)).toEqual('');
    
      expect(preprocessor.preprocessFraction('1.3m', NumericDurationPattern.hour)).toEqual('');
      expect(preprocessor.preprocessFraction('1.3nmnm', NumericDurationPattern.hour)).toEqual('');
    
      expect(preprocessor.preprocessFraction('1.3.3', NumericDurationPattern.day)).toEqual('');
      expect(preprocessor.preprocessFraction('2.3h 3.3', NumericDurationPattern.hour)).toEqual('');
      expect(preprocessor.preprocessFraction('3d, 4h, 10m', NumericDurationPattern.day)).toEqual('');
    });
  });
  
  describe('compare patterns', () => {
    test('first preprocess fraction', () => {
      const intermediateStep = preprocessor.preprocessFraction('0.5h:30m', NumericDurationPattern.day);

      expect(preprocessor.preprocessCompactHours(intermediateStep)).toEqual('30m30m');
    });
    
    test('first preprocess compact hours', () => {
      const intermediateStep = preprocessor.preprocessCompactHours('.5h:30');

      expect(preprocessor.preprocessFraction(intermediateStep, NumericDurationPattern.day)).toEqual('30m30m');
    });
  });
});
