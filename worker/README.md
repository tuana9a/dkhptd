# dkhptd-worker

## launchOption

headless mode in window

```json
{
  "slowMo": 10,
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  },
  "executablePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "userDataDir": "./userdata.tmp/"
}
```

visible mode in window

```json
{
  "headless": false,
  "slowMo": 10,
  "defaultViewport": null,
  "executablePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "userDataDir": "./userdata.tmp/"
}
```

headless mode in linux

```json
{
  "slowMo": 10,
  "defaultViewport": {
    "width": 1920,
    "height": 1080
  },
  "executablePath": "google-chrome-stable",
  "userDataDir": "./userdata.tmp/"
}
```

visible mode in linux

```json
{
  "slowMo": 10,
  "headless": false,
  "defaultViewport": null,
  "executablePath": "google-chrome-stable",
  "userDataDir": "./userdata.tmp/"
}
```
