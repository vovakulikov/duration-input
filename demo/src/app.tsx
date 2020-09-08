import React, { ChangeEvent, useCallback, useState } from 'react';
import { hot } from 'react-hot-loader';

import { useDurationParser, NumericDurationPattern } from "../../src";

const INTL_RU = {
  days: 'дней',
  day: 'день',
  hours: 'часы',
  hour: 'часов',
  minutes: 'минут',
  minute: 'минута',
};

function App() {
  const format =  NumericDurationPattern.day;
  // Value of input
  const [value, setValue] = useState<string>('');
  
  // Parser and formatter
  const { parse, format: formatted } = useDurationParser({ intl: INTL_RU });
  
  const handleBlur = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { isValid, parsedValue, formattedValue, rawValue } = parse(event.target.value, format);
    
    const nextValue = isValid ? formattedValue : rawValue;
    
    console.log('Parse event', { isValid, parsedValue, formattedValue, rawValue });
    setValue(nextValue);
  }, [format, parse, formatted]);
  
  return (
    <input
      value={value}
      onBlur={handleBlur}
      onChange={(event) =>  setValue(event.target.value)}
    />
  );
}

export default hot(module)(App);
