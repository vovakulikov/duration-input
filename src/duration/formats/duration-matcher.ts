import { IProcessedDurationI18n } from "../duration-i18n";

export class DurationMatcher {
  
  private intl: IProcessedDurationI18n;

  constructor(intl: IProcessedDurationI18n) {
    this.intl = intl;
  }

  isDayShortcut = (input: string): boolean =>
    this.isShortcutMatch(input, this.intl.dayFirstLetter) ||
    this.isShortcutMatch(input, this.intl.day) ||
    this.isShortcutMatch(input, this.intl.days);
  
  isHourShortcut = (input: string): boolean =>
    this.isShortcutMatch(input, this.intl.hourFirstLetter) ||
    this.isShortcutMatch(input, this.intl.hour) ||
    this.isShortcutMatch(input, this.intl.hours);
  
  isMinuteShortcut = (input: string): boolean =>
    this.isShortcutMatch(input, this.intl.minuteFirstLetter) ||
    this.isShortcutMatch(input, this.intl.minute) ||
    this.isShortcutMatch(input, this.intl.minutes);
  
  private isShortcutMatch(input: string, shortcut: string):boolean {
    const inputText = input.toLowerCase();
    const shortcutText = shortcut.toLowerCase();
    
    return inputText.startsWith(shortcutText);
  }
}
