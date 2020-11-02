<img src="/assets/duration-input.png" />

<div>
  <strong>Duration parser</strong> simple hook to build you own duration input.
</div>
 
## Features

- **Small**: Just 2 KB gzipped
- **Fast**: Parse complex duration string in milliseconds
- **Flexible**: Duration model allows us to work with complex duration easily.
- **Simple**: The interface and models are straight forward and easy to use.
- **Intl support**: Use your lang for day/hour/minute strings.
- **No dependencies** 

You can try it on [live demo page](https://vovakulikov.github.io/duration-input/)

## Install

`npm install duration-parser`

## Usage

```jsx
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
   rawValue
  } = parse(event.target.value, format);
  
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
```

#### Duration model

Also you can find a Duration model to handle.

Operation
- `add(first: Duration, second:Duration)`
- `subtract(first: Duration, second:Duration)`
- `multiply(first: Duration, second:Duration)`
- `divide(first: Duration, second:Duration)`
- `abs(d: Duration): Duration`
- `isNegative(d: Duration): boolean`

Converters
- `inDays` - number of whole days spanned by this Duration. 
- `inHour` - number of whole hours spanned by this Duration. 
- `inMinutes` - number of whole minutes spanned by this Duration. 
- `inSeconds` - number of whole seconds spanned by this Duration. 


#### Usage

```js
import { Duration } from "duration-parser";

const workDay = new Duration({ hour: 8 });
const overTime = new Duration({ hour: 2, minutes: 30 })

// Converters
console.log(inHours(workDay)) // -> 8
console.log(inMinutes(workDay)) // -> 480, because 8 * 60 = 480
console.log(inSeconds(workDay)) // ->  28800, because 8 * 60 * 60
console.log(inSeconds(workDay)) // ->  28800, because 8 * 60 * 60

// Duration operators
console.log(inMinutes(add(workDay, overTime))) // 630
console.log(toString(add(workDay, overTime))) // 10:30:00.000
```

**Duration parsers** works out-of-the-box for most browsers, regardless of version
