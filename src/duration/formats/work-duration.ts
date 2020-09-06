
export class WorkDuration {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  
  constructor(days: number, hours: number, minutes: number) {
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
  };
}

export function compareToDays(duration: WorkDuration, days: number): number {
  if(duration.days < days) return -1;
  if(duration.days > days) return 1;
  if(duration.hours > 0 || duration.minutes > 0) return 1;
  
  return 0;
}
