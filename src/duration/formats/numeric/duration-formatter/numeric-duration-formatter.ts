import { Duration, inMinutes } from "../../../duration";
import { createIntl, IDurationI18n, IProcessedDurationI18n } from "../../../duration-i18n";
import { NumericDurationPattern } from "../numeric-duration-pattern";
import { DEFAULT_INTL, DEFAULT_DAY_DURATION } from "../../../constants";

export type INumericDurationFormatterProps = {
  intl?: IDurationI18n;
  dayDuration?: Duration;
}

export class NumericDurationFormatter {
  
  private intl: IProcessedDurationI18n;
  private dayDuration: Duration;
  
  constructor(props?: INumericDurationFormatterProps) {
    const {
      intl = DEFAULT_INTL,
      dayDuration = DEFAULT_DAY_DURATION,
    } = props ?? {};
    
    this.intl = createIntl(intl);
    this.dayDuration = dayDuration;
  }
  
  format(value: number|null, format: NumericDurationPattern|null, workDayDuration = this.dayDuration) {
    if (value == null) {
      return '';
    }
    
    if (format == null) {
      throw new TypeError('Bad argument: null format');
    }

    const days = format == NumericDurationPattern.day ? Math.floor(value / inMinutes(workDayDuration)) : 0;
    const hours = Math.floor((value - days * inMinutes(workDayDuration)) / Duration.minutesPerHour);
    const minutes = Math.floor(value - days * inMinutes(workDayDuration) - hours * Duration.minutesPerHour);
    
    const buffer: Array<string> = [];

    if (days != 0) {
      buffer.push(`${days}${this.intl.dayFirstLetter}`);
    }

    if (hours != 0) {
      buffer.push(`${hours}${this.intl.hourFirstLetter}`);
    }
    
    if (minutes != 0) {
      buffer.push(`${minutes}${this.intl.minuteFirstLetter}`);
    }

    return buffer.join(' ');
  }
  
  coerce(value: Duration|null): number|null {
    return value != null ? inMinutes(value) : value;
  }

  export(value: number|null): string|null {
    if (value != null) {
      return (value / Duration.minutesPerDay).toString();
    } else {
      return null;
    }
  }
}
