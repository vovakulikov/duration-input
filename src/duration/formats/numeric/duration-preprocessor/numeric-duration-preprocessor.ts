import { DurationMatcher } from "../../duration-matcher";
import { NumericDurationFormatter } from "../duration-formatter/numeric-duration-formatter";
import { createIntl, IProcessedDurationI18n } from "../../../duration-i18n";
import { Duration, inMinutes } from "../../../duration";
import { NumericDurationPattern } from "../numeric-duration-pattern";
import { DEFAULT_DAY_DURATION, DEFAULT_INTL } from "../../../constants";

export type INumericDurationPreprocessorProps = {
  intl?: IProcessedDurationI18n,
  dayDuration?: Duration;
}

export class NumericDurationPreprocessor {
  private static separator = '\\s';
  private static fractionDelimiter = '[\\.|\\,]';
  private static hourDelimiter = '\\:';
  
  private static digit = `\\d*${NumericDurationPreprocessor.fractionDelimiter}?\\d*`;
  private static group = `(${NumericDurationPreprocessor.digit})${NumericDurationPreprocessor.separator}*(?:[^${NumericDurationPreprocessor.separator}\\d\\.\\,]*)`;
  
  private static hourPattern = `${NumericDurationPreprocessor.group}${NumericDurationPreprocessor.hourDelimiter}${NumericDurationPreprocessor.group}`;
  private static hourExpression = new RegExp(NumericDurationPreprocessor.hourPattern);
  
  private static fractionPattern = `${NumericDurationPreprocessor.separator}*(\\d*${NumericDurationPreprocessor.fractionDelimiter}\\d*)${NumericDurationPreprocessor.separator}*(?:[^${NumericDurationPreprocessor.separator}\\d\\.\\,]*)`;
  private static fractionExpression = new RegExp(NumericDurationPreprocessor.fractionPattern);
  
  private static patternDetectedFractionStep = new RegExp(`${NumericDurationPreprocessor.digit}${NumericDurationPreprocessor.separator}*([^${NumericDurationPreprocessor.separator}\\d.\\,]*)`);
  
  private intl: IProcessedDurationI18n;
  private dayDuration: Duration;
  private matcher: DurationMatcher;
  private formatter: NumericDurationFormatter;
  
  constructor(props: INumericDurationPreprocessorProps) {
    const {
      intl = DEFAULT_INTL,
      dayDuration = DEFAULT_DAY_DURATION
    } = props;
    
    this.intl = createIntl(intl);
    this.dayDuration = dayDuration;
    this.matcher = new DurationMatcher(this.intl);
    this.formatter = new NumericDurationFormatter({ intl });
  }
  
  preprocessCompactHours(text: string): string {
    const hourDelimiterMatchesCount = text.match(new RegExp(`(${NumericDurationPreprocessor.hourDelimiter})`, 'g'))?.length ?? 0;
    
    if (hourDelimiterMatchesCount > 1) {
      return '';
    }
      
    return text.replace(NumericDurationPreprocessor.hourExpression, (_ , ...matchGroups: Array<string>) => {
      const result = [];
      const groups = this.getGroupsExceptPatternMatch(matchGroups);
      
      if (groups[0].length != 0) {
        result.push(`${groups[0]}${this.intl.hourFirstLetter}`);
      }
      
      if (groups[1].length != 0) {
        result.push(`${groups[1]}${this.intl.minuteFirstLetter}`);
      }

      return result.join('');
    });
  }

  preprocessFraction(text: string, format: NumericDurationPattern): string {
    const fractionDelimiterMatchesCount = text.match(new RegExp(`(${NumericDurationPreprocessor.fractionDelimiter})`, 'g'))?.length ?? 0;
  
    if (fractionDelimiterMatchesCount > 1) {
      return '';
    }
  
    return text.replace(NumericDurationPreprocessor.fractionExpression, (match: string, ...matchGroups) => {
      const fractionGroups = match.match(NumericDurationPreprocessor.patternDetectedFractionStep) ?? [];
      const dividers = this.getMatchesExceptPatterMatch(fractionGroups);
      const divider = dividers[0] ?? '';
      
      const fractionLetter = this.detectFractionLetter(divider, format);
      
      if (fractionLetter == null) {
        return ''
      }
      
      const groups = this.getGroupsExceptPatternMatch(matchGroups);
      const fraction = +groups[0];
      
      if (isNaN(fraction)) {
        return '';
      }
      
      const minutes = +fraction.toFixed(2) * this.calcMultiplicityStep(divider, format);

      return this.formatter.format(Math.ceil(minutes), format) ?? '';
    });
  }
  
  private detectFractionLetter(detectedPart: string, format: NumericDurationPattern): string|null {
    if (this.matcher.isDayShortcut(detectedPart)) {
      return this.intl.hourFirstLetter;
    }
    
    if (this.matcher.isHourShortcut(detectedPart)) {
      return this.intl.minuteFirstLetter;
    }
    
    if (detectedPart.length > 0) return null;
    
    return format == NumericDurationPattern.day ? this.intl.hourFirstLetter : this.intl.minuteFirstLetter;
  }

  private calcMultiplicityStep(detectedPart: string, format: NumericDurationPattern): number {
    if (this.matcher.isDayShortcut(detectedPart)) {
      return inMinutes(this.dayDuration);
    }
    
    if (this.matcher.isHourShortcut(detectedPart)) {
      return Duration.minutesPerHour;
    }
    
    return (format == NumericDurationPattern.day
      ? inMinutes(this.dayDuration)
      : Duration.minutesPerHour);
  }
  
  private getGroupsExceptPatternMatch(groups: Array<string>) {
    // Cause we should get only pure match groups without last to arguments (offset, origin string)
    return groups.slice(0, -2);
  }
  
  private getMatchesExceptPatterMatch(matches: Array<string>) {
    return matches.slice(1);
  }
}
