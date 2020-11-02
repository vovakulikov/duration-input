import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { hot } from 'react-hot-loader';
import classNames from "classnames";

import { useDurationParser, NumericDurationPattern, Duration, add, inHours } from "../../src";
import { DEFAULT_INTL } from "../../src/duration/constants";

import styles from './demo.scss';
import { IDurationI18n } from "../../src/duration/duration-i18n";

const INTL_RU = {
  days: 'дней',
  day: 'день',
  hours: 'часы',
  hour: 'часов',
  minutes: 'минут',
  minute: 'минута',
};

const INLT_OPTIONS: Record<string, IDurationI18n> = {
  'Russian': INTL_RU,
  'Default_English': DEFAULT_INTL,
};

function CommonExample() {
  // Parsing format
  const [format, setFormat] = useState<NumericDurationPattern>(NumericDurationPattern.day);
  const [intl, setIntl] = useState<IDurationI18n>(INLT_OPTIONS.Default_English);
  // Value of input
  const [value, setValue] = useState<string>('');
  const [isFocus, setFocus] = useState<boolean>(false);
  const [isValid, setValid] = useState<boolean>(true);
  const [isTouched, setTouched] = useState<boolean>(false);
  const [dayDurationInHours, setDayDurationInHours] = useState<number>(8);
  
  const dayDuration = useMemo(() => {
    console.log(dayDurationInHours);
    console.log(isNaN(+dayDurationInHours));
    const normalizedDayDurationInHours = isNaN(+dayDurationInHours) || dayDurationInHours <= 0 ? 8 : dayDurationInHours;
    
    return new Duration({ hours: normalizedDayDurationInHours });
  }, [dayDurationInHours]);
  
  // Parser and formatter
  const { parse } = useDurationParser({ intl: intl, dayDuration });
  
  useEffect(() => {
    const workDay = new Duration({ hours: 8 });
    const overTime = new Duration({ hours: 2, minutes: 30 });
    
    console.log(inHours(add(workDay, overTime)));

    if (isFocus) {
      return;
    }
    
    const { isValid, formattedValue, rawValue, parsedValue } = parse(value, format);
    const nextValue = isValid ? formattedValue : rawValue;
  
    console.log('Parse event', { isValid, parsedValue, formattedValue, rawValue });
    setValue(nextValue);
    
    if (isTouched) {
      setValid(isValid);
    }
  }, [parse, isFocus]);

  const handleBlur = useCallback((_: ChangeEvent<HTMLInputElement>) => {
    setFocus(false);
  }, [format, parse]);
  
  const handleFocus = (_: ChangeEvent<HTMLInputElement>) => {
    setFocus(true);
  };
  
  function handleFormatChange(event: ChangeEvent<HTMLSelectElement>) {
    const newFormat = event.target.value as NumericDurationPattern;
    const { isValid, formattedValue, rawValue } = parse(value, newFormat);
    const nextValue = isValid ? formattedValue : rawValue;
    
    setValue(nextValue);
    setFormat(newFormat);
  }
  
  function handleIntlChange(event: ChangeEvent<HTMLSelectElement>) {
    const newIntlKey = event.target.value;
    const nextIntl = INLT_OPTIONS[newIntlKey];
  
    setIntl(nextIntl);
  }
  
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const { isValid: nextIsValid } = parse(value, format);
    
    setValue(value);
    setTouched(true);
    
    if (!isValid) {
      setValid(nextIsValid);
    }
  }
  
  const intlKey = Object
    .keys(INLT_OPTIONS)
    .find((currentIntl) => intl == INLT_OPTIONS[currentIntl]);
  
  return (
    <section>
      
      <h1>Duration input</h1>
      
      <p>
        This input can parse his value as a Duration model and after display formatted value.
        For instance, user input is '12 34 10' string, we can parse that input as 12 day and 34 minutes
        and the value will be '12d 34h 10m' (d,h,m - days, hours, and minutes was formed according
        to intl options and format settings which can be set up by consumer)
      </p>
  
      <p>
        You can use two format types: <br/>
        <br/>
        <b>Day</b> - will format your duration to days, hours, minutes <br/>
        <b>Hour</b> - will format your duration to hours, minutes <br/>
      </p>
  
      <h3>Inputs</h3>
      
      <section className={styles.controlContainer}>
        
        <label className={styles.control}>
          
          Size:
          <select
            name="format"
            id="format"
            value={format}
            onChange={handleFormatChange}>

            { Object.keys(NumericDurationPattern).map((size) => (<option key={size} value={size}> { size } </option>)) }
          </select>
        </label>
  
        <label className={styles.control}>
    
          Intl:
          <select
            name="intl"
            id="intl"
            value={intlKey}
            onChange={handleIntlChange}>
      
            { Object.keys(INLT_OPTIONS).map((intl) => (<option key={intl} value={intl}> { intl } </option>)) }
          </select>
        </label>
  
        <label className={styles.control}>
    
          Day duration (in hours):
          <input
            type="number"
            defaultValue={8}
            onBlur={(event) => {
              console.log('blur');
              setDayDurationInHours(+event.target.value)
            }}/>
        </label>
        
      </section>
  
      <div className={styles.demoBlock}>
    
        <input
          value={value}
          placeholder={'Type 2d or 2 days/hour/min'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onChange={handleInputChange}
          className={classNames({ [styles.inputInvalid]: !isValid }, styles.input)}
        />
      </div>
  
      <pre className={styles.pre}>
        {
          `
  import { useDurationParser, NumericDurationPattern } from "duration-parser";

  function DurationInput() {
    // First number is a day
    const format =  NumericDurationPattern.day;
    const [value, setValue] = useState('');
    
    const handleBlur = useCallback((event) => {
      const {
       isValid,
       parsedValue,
       formattedValue,
       rawValue } = parse(event.target.value, format);
      
      const nextValue = isValid ? formattedValue : rawValue;
      
      setValue(nextValue);
    }, [format, parse]);

    return (
     <input
        value={value}
        onBlur={handleBlur}
        onChange={(event) => setValue(event.target.value)}/>
    );
  }

`
        }
      </pre>
    </section>
  );
}

function App() {
  
  return (
    <div className={styles.container}>
  
      <CommonExample/>
    </div>
  );
}

export default hot(module)(App);
