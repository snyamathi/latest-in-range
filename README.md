# latest-in-range

## Usage

`npx latest-in-range`

## What it does

Reads your package.json and updates each semver range to the latest published version in that range.  Examples:

-  `"lodash": "^3.0.0"` => `"lodash": "^3.11.0"`
-  `"lodash": "~4.11.0"` => `"lodash": "~4.11.2"`
