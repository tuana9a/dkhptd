# auto import jobs

The project structure look like

```
| -- jobs/
|      | -- Job1.js
|      | -- Job2.js
| -- app/
|      | -- index.js
```

`app/index.js` wants to **import** or **require** `Job1` or `Job2`

```js
const job1 = require("./jobs/job1"); // FAILED

// adding "../"
const job1 = require("../jobs/job1"); // work
```
