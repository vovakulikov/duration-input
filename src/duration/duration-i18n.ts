
export type IDurationI18n = {
  days: string;
  day: string;
  hours: string;
  hour: string;
  minutes: string;
  minute: string;
  dayFirstLetter?: string;
  hourFirstLetter?: string;
  minuteFirstLetter?: string;
}

export type IProcessedDurationI18n = Required<IDurationI18n>;

export function createIntl(intl: IDurationI18n): IProcessedDurationI18n {
  return {
    ...intl,
    dayFirstLetter: intl.day[0],
    hourFirstLetter: intl.hour[0],
    minuteFirstLetter: intl.minute[0],
  }
}
