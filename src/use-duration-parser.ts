import { useCallback, useMemo } from "react";

import { NumericDurationFormatter, NumericDurationParser, NumericDurationPattern } from "./duration/formats";
import { Duration, inMinutes } from "./duration";
import { IDurationI18n } from "./duration/duration-i18n";
import { DEFAULT_DAY_DURATION, DEFAULT_INTL } from "./duration/constants";

export type IProps = {
  intl?: IDurationI18n;
  dayDuration?: Duration;
}

export type IParseEvent = {
  // Duration in case when we've got a valid string which has been parsed
  // in case we could not parsed value we will get null duration
  parsedValue: Duration|null;
  // Represent of success or failure of parsing origin string
  isValid: boolean;
  // Origin string from input for parse
  rawValue: string;
  // Formatted string in case if we've got a valid string neither we will get empty string
  formattedValue: string;
};

export type IUseDurationAPI = {
  parse: (value: string, format: NumericDurationPattern) => IParseEvent;
  format: (value: Duration|null, format: NumericDurationPattern) => string;
}

export function useDurationParser(props?: IProps): IUseDurationAPI {
  const {
    intl = DEFAULT_INTL,
    dayDuration = DEFAULT_DAY_DURATION,
  } = props ?? {};

  const parser = useMemo(
    () => new NumericDurationParser({ intl, dayDuration }),
    [dayDuration, intl]
  );
  const formatter = useMemo(
    () => new NumericDurationFormatter({ intl, dayDuration }),
    [dayDuration, intl]
  );
  
  const formatDuration = useCallback(
    (duration: Duration|null, format: NumericDurationPattern) => {
      if (duration == null) {
        return '';
      }
      
      return formatter.format(inMinutes(duration), format)
    },
    [formatter]
  );
  
  const parse = useCallback(
    (value: string, format: NumericDurationPattern) => {
      const parsedValue = parser.parse(value, format);
      
      const isValid = parsedValue != null;
      
      return {
        rawValue: value,
        parsedValue: parsedValue,
        isValid: isValid,
        formattedValue: isValid ? formatDuration(parsedValue, format) : ''
      };
    },
    [parser, formatDuration]
  );
  
  return {
    parse,
    format: formatDuration,
  }
}
