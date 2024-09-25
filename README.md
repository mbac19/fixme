# Math Equation Parser

A library for parsing math equations in Javascript.

## What To Do

- Download [node js](https://nodejs.org/en/download/)
- Clone the repo
- Install dependencies: `npm i`
- Run the unit tests: `npm run test`
- *Or watch the unit tests:* `npm run test -- --watch`

## Features

- Custom Binary Operators
- Custom Function Operators
- Custom Unary Operators
- Implicit Multiplication
- Math Symbols ('x', 'y', etc...)
- Configure for Left and Right Associativity

## Basic Usage

```typescript
import Parser from "math-equation-parser";

console.log(Parser.parse("1 + 2"));
```

##### Printed Value

```typescript
{
  "type": "BinaryOperator",
  "name": "Sum",
  "left": {
    "type": "Literal",
    "name": "Literal",
    "value": 1
  },
  "right": {
    "type": "Literal",
    "name": "Literal",
    "value": 2
  }
}
```
