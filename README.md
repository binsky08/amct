# Amct

_An angular based multiple choice test framework_

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Configure custom questions

Open `assets/config.json` and add a custom test config to `tests`.

Set the relative path to your custom questions configuration file at `questions`.

The `uniqueIdentifier` is used as url parameter to easily share the test.

Example:
```json
"tests": [
    {
      "title": "Programmiermethoden und Werkzeuge - Vorübung",
      "questions": "assets/tests/progmeth1.json",
      "numberOfRandomQuestions": 5,
      "uniqueIdentifier": "progmeth1"
    },
    {
      "title": "My custom test",
      "questions": "assets/tests/myQuestionnaire.json",
      "numberOfRandomQuestions": 5,
      "uniqueIdentifier": "customTestId"
    }
]
```

## Question format

There are already three possible question formats:

### Single selection
- use the value `radio` as type in myQuestionnaire.json
- only one value of all possible answers is allowed to be true

### Multiple selection
- use the value `checkbox` as type in myQuestionnaire.json
- answers can be mixed, all true or all false

### Drop lists
- use the value `dropList` as type in myQuestionnaire.json
- the order of the answers in json corresponds to the order accepted as correct in the test
- in the current version all answers require the value to be true
- the question requires the keyword `orientation` in the question to be `horizontal` or `vertical`
  - with more than two words per answer the vertical orientation is recommended

Example of three different question definitions in `assets/tests/myQuestionnaire.json`:
```json
[
  {
    "name": "What is 1+1?",
    "type": "radio",
    "answers": [
      {
        "text": "0",
        "value": false
      },
      {
        "text": "1",
        "value": false
      },
      {
        "text": "2",
        "value": true
      }
    ]
  },
  {
    "name": "Select all words, starting with a \"d\".",
    "type": "checkbox",
    "answers": [
      {
        "text": "dumb",
        "value": true
      },
      {
        "text": "definitely",
        "value": true
      },
      {
        "text": "teacher",
        "value": false
      }
    ]
  },
  {
    "name": "Sort these entries!",
    "type": "dropList",
    "orientation": "vertical",
    "answers": [
      {
        "text": "First entry",
        "value": true
      },
      {
        "text": "Second entry",
        "value": true
      },
      {
        "text": "Third entry",
        "value": true
      }
    ]
  }
]
```

## Online example

Visit https://amct.binsky.org to see a working example
