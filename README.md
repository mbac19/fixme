# Math Equation Parser

A library for parsing math equations in Javascript.

## Setup Environment

- Download [node js](https://nodejs.org/en/download/)
- Download [yarn package manager](https://yarnpkg.com/en/)
- Clone the repo
- Run the following command: `yarn`
- To rebuild the source code, run `npm run build`
- To run the unit tests, run `npm run test`
  - `npm run test-watch` to reload unit tests on file changes

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
