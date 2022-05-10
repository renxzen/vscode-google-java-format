# google-java-format

**FORK FROM SERIKB's REPO AND BUILD ON TOP: https://github.com/serikb/vscode-google-java-format**

This is a VS Code extension for running the google-java-format tool as a Java formatter. Serikb extension was working fine, he wrote this as a super simple formatter provider that will just run the google-java-format script from a local installation. I made some configuration to replace spaces with tabs, since i know people that preffer them, including me. Since google-java-format doesn't provide this function, and i'm writing a lot of java lately, i had to make a quick hack.

Serikb: "It should work as a formatter for only sections of files as well."

## Features

It provides a formatter for the Java language, meaning it runs google-java-format for you. Install google-java-format from e.g. AUR or Homebrew and set it as your Java formatter like:

```json
"[java]": {
  "editor.defaultFormatter": "renxzen.google-java-format-tabs",
}
```

## Extension Settings

Use the setting "google-java-format.executable-path" to set the path to the google-java-format executable. The extension does not look in `$PATH` right now.

## Known Issues

When its converting spaces to tabs, it could lead to lines having more than 140 char width

## Release Notes

### 1.1.1

Added spaces to tabs conversion

### 1.0.1

Added ability to pass extra args via "google-java-format.args"

### 1.0.0

Initial release.
