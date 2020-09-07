import { createIntl } from "./duration-i18n";
import { Duration } from "./duration";

// This is ENG default intl for duration parsers and  formatters
const DefaultDurationI18nTemplate = {
  days: 'days',
  day: 'day',
  hours: 'hours',
  hour: 'hour',
  minutes: 'minutes',
  minute: 'minute',
};

// Instance of default intl object
export const DEFAULT_INTL = createIntl(DefaultDurationI18nTemplate);

// Instance of default day daration (24 hours in a day or 8 like example below typical workday duration)
export const DEFAULT_DAY_DURATION = new Duration({ hours: 8 });
