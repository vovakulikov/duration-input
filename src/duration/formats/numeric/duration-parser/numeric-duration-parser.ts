import { DurationMatcher } from "../../duration-matcher";
import { NumericDurationPattern } from "../numeric-duration-pattern";
import { Duration, inMinutes } from "../../../duration";
import { NumericDurationPreprocessor } from "../duration-preprocessor/numeric-duration-preprocessor";
import { createIntl, IDurationI18n, IProcessedDurationI18n } from "../../../duration-i18n";
import { DEFAULT_INTL, DEFAULT_DAY_DURATION } from "../../../constants";

export type INumericDurationParserProps = {
  intl?: IDurationI18n;
  dayDuration?: Duration;
}

export class NumericDurationParser {
  private static separator = '\\s';
  private static fractionDelimiter = '[\\.|\\,]';
  private static digit = `(?:\\d+${NumericDurationParser.fractionDelimiter}\\d+)|(?:\\d+${NumericDurationParser.fractionDelimiter})|(?:${NumericDurationParser.fractionDelimiter}?\\d+)`;
  private static group = `(${NumericDurationParser.digit})${NumericDurationParser.separator}*([^${NumericDurationParser.separator}\\d\\.\\,]*)`;
  private static pattern = `^${NumericDurationParser.separator}*${NumericDurationParser.group}(?:${NumericDurationParser.separator}*${NumericDurationParser.group})?(?:${NumericDurationParser.separator}*${NumericDurationParser.group})?${NumericDurationParser.separator}*\$`;
  
  private static expression = new RegExp(NumericDurationParser.pattern);
  
  private static patternForPreprocessed =
    `^${NumericDurationParser.separator}*${NumericDurationParser.group}(?:${NumericDurationParser.separator}*${NumericDurationParser.group})?(?:${NumericDurationParser.separator}*${NumericDurationParser.group})?(?:${NumericDurationParser.separator}*${NumericDurationParser.group})?${NumericDurationParser.separator}*\$`;
  private static expressionForPreprocessed = new RegExp(NumericDurationParser.patternForPreprocessed);
  
  
  private intl: IProcessedDurationI18n;
  private dayDuration: Duration;
  private matcher: DurationMatcher;
  private preprocessor: NumericDurationPreprocessor;
  
  constructor(props?: INumericDurationParserProps) {
    const {
      dayDuration = DEFAULT_DAY_DURATION,
      intl = DEFAULT_INTL
    } = props ?? {};
    
    this.intl = createIntl(intl);
    this.dayDuration = dayDuration;
    this.matcher = new DurationMatcher(this.intl);
    this.preprocessor = new NumericDurationPreprocessor(
      { dayDuration: this.dayDuration, intl: this.intl }
      );
  }
  
  parse(text: string, format: NumericDurationPattern): Duration|null {
    if (text == null) {
      return null;
    }

    if (format == null) {
      throw new Error('Bad argument: null format');
    }
    
    return this.parsePattern(text, format);
  }

  private calcSegment = (segments: Array<number>): number => segments.reduce<number>( (prev, element) => prev + element, 0,);

  private getSegments(groups: Array<string>, isShortcut: (shortcut: string) => boolean): Array<number> {
    return this.range(0, groups.length, 2)
      .filter((i) => isShortcut(groups[i + 1]))
      .map((i) => +groups[i])
  }
  
  private range(startOrStop: number, stop?: number, step = 1): Array<number> {
    const start = stop == null ? 0 : startOrStop;
    stop = stop == null ? startOrStop : stop;
    
    if (step == 0) {
      throw new Error('Bad arguments: step cannot be 0');
    }
    
    if (step > 0 && stop < start) {
      throw new Error('Bad arguments: if step is positive, stop must be greater than start');
    }
    
    if (step < 0 && stop > start) {
      throw Error('Bad arguments: if step is negative, stop must be less than start');
    }
  
    const range = [];
    
    for (let value = start; step < 0 ? value > stop : value < stop; value += step) {
      range.push( value);
    }
    
    return range;
  }

  private isIntegerOverflow(value:number): boolean {
    return value + 1 == value;
  }

  private normalize(groups: Array<string>, format: NumericDurationPattern): Array<string> {
    const normalizedGroups: Array<string> = [];
    const firstSymbol = format == NumericDurationPattern.day
      ? this.intl.dayFirstLetter
      : this.intl.hourFirstLetter;
    
    for (var i = 0; i < groups.length; i++) {
      const currentGroup = groups[i];
      
      if (currentGroup.length == 0) {
        if (i <= 1) {
          normalizedGroups.push(firstSymbol);
        } else if (!isNaN(+normalizedGroups[i - 1])) {
          const previousTimeShortCut = normalizedGroups[i - 2];
          
          if (this.matcher.isDayShortcut(previousTimeShortCut)) normalizedGroups.push(this.intl.hourFirstLetter);
          if (this.matcher.isHourShortcut(previousTimeShortCut)) normalizedGroups.push(this.intl.minuteFirstLetter);
        }
        
        continue;
      }
      
      normalizedGroups.push(currentGroup);
    }
    
    return normalizedGroups;
  }

  private parsePattern(text: string, format: NumericDurationPattern): Duration|null {
    let preprocessedText = this.preprocessor.preprocessCompactHours(text);
    let match = preprocessedText.match(NumericDurationParser.expression);
    
    if (match == null) {
      return null;
    }
    
    let groups = this.normalize(this.getMatchesExceptPatterMatch(match), format);
    
    preprocessedText = this.preprocessor.preprocessFraction(groups.join(''), format);
    match = preprocessedText.match(NumericDurationParser.expressionForPreprocessed);

    if (match == null) return null;
    
    groups = this.getMatchesExceptPatterMatch(match);
    
    const days = this.getSegments(groups, this.matcher.isDayShortcut);
    const hours = this.getSegments(groups, this.matcher.isHourShortcut);
    const minutes = this.getSegments(groups, this.matcher.isMinuteShortcut);
    
    const day = this.calcSegment(days);
    const hour = this.calcSegment(hours);
    const minute = this.calcSegment(minutes);
    const duration = new Duration({ hours: hour, minutes: minute + day * inMinutes(this.dayDuration) });
    
    const hasInvalidSegments = days.length + hours.length + minutes.length != groups.length / 2;
    
    return hasInvalidSegments || this.isIntegerOverflow(duration.inMicroseconds) ? null : duration;
  }
  
  private getMatchesExceptPatterMatch(matches: Array<string>) {
    return matches
      .slice(1)
      .filter((group) => group != null);
  }
}
