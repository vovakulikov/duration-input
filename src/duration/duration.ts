
export class Duration {
  static microsecondsPerMillisecond = 1000;
  static millisecondsPerSecond = 1000;
  static secondsPerMinute = 60;
  static minutesPerHour = 60;
  static hoursPerDay = 24;
  
  static microsecondsPerSecond =
    Duration.microsecondsPerMillisecond * Duration.millisecondsPerSecond;
  
  static microsecondsPerMinute =
    Duration.microsecondsPerSecond * Duration.secondsPerMinute;
  static microsecondsPerHour = Duration.microsecondsPerMinute * Duration.minutesPerHour;
  static microsecondsPerDay = Duration.microsecondsPerHour * Duration.hoursPerDay;
  
  static millisecondsPerMinute =
    Duration.millisecondsPerSecond * Duration.secondsPerMinute;
  static millisecondsPerHour = Duration.millisecondsPerMinute * Duration.minutesPerHour;
  static millisecondsPerDay = Duration.millisecondsPerHour * Duration.hoursPerDay;
  
  static secondsPerHour = Duration.secondsPerMinute * Duration.minutesPerHour;
  static secondsPerDay = Duration.secondsPerHour * Duration.hoursPerDay;
  
  static minutesPerDay = Duration.minutesPerHour * Duration.hoursPerDay;
  
  static zero = new Duration({ seconds: 0 });
  
  private readonly duration: number;
  
  /**
   * Creates a new Duration object whose value
   * is the sum of all individual parts.
   *
   * Individual parts can be larger than the next-bigger unit.
   * For example, [hours] can be greater than 23.
   *
   * All individual parts are allowed to be negative.
   * All arguments are 0 by default.
   */
  constructor(
    { days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
      milliseconds = 0,
      microseconds = 0 }) {
   
    this.duration = Duration.microsecondsPerDay * days +
      Duration.microsecondsPerHour * hours +
      Duration.microsecondsPerMinute * minutes +
      Duration.microsecondsPerSecond * seconds +
      Duration.microsecondsPerMillisecond * milliseconds +
      microseconds
  }
  
  static fromMicroseconds = (microseconds: number) => new Duration({ microseconds });
  
  /**
   * Returns number of whole microseconds spanned by this Duration.
   */
  get inMicroseconds() {
    return this.duration;
  }
}

/**
 * Adds this Duration and [other] and
 * returns the sum as a new Duration object.
 */
export function add (first: Duration, other: Duration): Duration {
  return Duration.fromMicroseconds(first.inMicroseconds + other.inMicroseconds);
}

/**
 * Subtracts [other] from this Duration and
 * returns the difference as a new Duration object.
 */
export function subtract (first:Duration, other: Duration): Duration {
  return Duration.fromMicroseconds(first.inMicroseconds - other.inMicroseconds);
}

/**
 * Multiplies this Duration by the given [factor] and returns the result
 * as a new Duration object.
 *
 * Note that when [factor] is a double, and the duration is greater than
 * 53 bits, precision is lost because of double-precision arithmetic.
 */
export function multiply (duration: Duration, factor: number): Duration {
  return Duration.fromMicroseconds(Math.round(duration.inMicroseconds * factor));
}

/**
 * Divides this Duration by the given [quotient] and returns the truncated
 * result as a new Duration object.
 *
 * Throws an [IntegerDivisionByZeroException] if [quotient] is `0`.
 */
export function divide (duration: Duration, quotient: number): Duration {
  if (quotient == 0) {
    throw new Error('IntegerDivisionByZeroException')
  }
  
  return Duration.fromMicroseconds(Math.floor(duration.inMicroseconds / quotient));
}

/**
 * Returns the number of whole days spanned by this Duration.
 */
export function inDays(duration: Duration): number {
  return Math.floor(duration.inMicroseconds / Duration.microsecondsPerDay);
}

/**
 * Returns the number of whole hours spanned by this Duration.
 *
 * The returned value can be greater than 23.
 */
export function inHours(duration: Duration):number {
  return Math.floor(duration.inMicroseconds / Duration.microsecondsPerHour);
}

/**
 * Returns the number of whole minutes spanned by this Duration.
 *
 * The returned value can be greater than 59.
 */
export function inMinutes(duration: Duration): number {
  return Math.floor(duration.inMicroseconds / Duration.microsecondsPerMinute);
}

/**
 * Returns the number of whole seconds spanned by this Duration.
 *
 * The returned value can be greater than 59.
 */
export function inSeconds(duration: Duration) {
  return Math.floor(duration.inMicroseconds / Duration.microsecondsPerSecond);
}

/**
 * Returns number of whole milliseconds spanned by this Duration.
 *
 * The returned value can be greater than 999.
 */
export function inMilliseconds(duration: Duration) {
  return Math.floor(duration.inMicroseconds / Duration.microsecondsPerMillisecond);
}



/**
 * Returns a string representation of this `Duration`.
 *
 * Returns a string with hours, minutes, seconds, and microseconds, in the
 * following format: `HH:MM:SS.mmmmmm`. For example,
 *
 *     var d = new Duration(days:1, hours:1, minutes:33, microseconds: 500);
 *     d.toString();  // "25:33:00.000500"
 */
export function toString(duration: Duration): string {
  function sixDigits(n: number) {
    if (n >= 100000) return `${n}`;
    if (n >= 10000) return `0${n}`;
    if (n >= 1000) return `00${n}`;
    if (n >= 100) return `000${n}`;
    if (n >= 10) return `0000${n}`;
    
    return `00000${n}`;
  }
  
  function twoDigits(n: number) {
    if (n >= 10) return `${n}`;
    
    return `0${n}`;
  }
  
  if (duration.inMicroseconds < 0) {
    return `-${-toString(duration)}`;
  }
  
  const twoDigitMinutes = twoDigits(inMinutes(duration) % Duration.minutesPerHour);
  const twoDigitSeconds = twoDigits(inSeconds(duration) % Duration.secondsPerMinute);
  const sixDigitUs = sixDigits(duration.inMicroseconds % Duration.microsecondsPerSecond);
  
  return `${inHours(duration)}:${twoDigitMinutes}:${twoDigitSeconds}.${sixDigitUs}`;
}

/**
 * Returns whether this `Duration` is negative.
 *
 * A negative `Duration` represents the difference from a later time to an
 * earlier time.
 */
export function isNegative(duration: Duration) {
  return duration.inMicroseconds < 0;
}

/**
 * Returns a new `Duration` representing the absolute value of this
 * `Duration`.
 *
 * The returned `Duration` has the same length as this one, but is always
 * positive.
 */
export function abs(duration: Duration): Duration {
  return Duration.fromMicroseconds(Math.abs(duration.inMicroseconds));
}
