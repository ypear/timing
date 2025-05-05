# <img src="https://github.com/benzmuircroft/temp/blob/main/Yjs.png" height="32" style="vertical-align:40px;"/>🍐# @ypear/timing ⏱️

### 💾 Installation

```sh
npm install @ypear/timing
```

### 👀 Description

Precision Time Boundary Utilities

### ✅ Usage

```js
// From timing.js implementation:
const timing = require('@ypear/timing');

// Returns timestamp for next day at 00:00:00
const tomorrow = timing.nextday(); 

// Returns timestamp for next hour at :00
const nextHour = timing.nextHour();

// Returns timestamp for next minute at :00
const nextMinute = timing.nextMinute();

// Schedule a daily task
setInterval(() => {
  timing.every('nextday', (dayStart) => {
    console.log('New day started at:', new Date(dayStart));
    // Daily maintenance tasks here
  });
}, 60000);
```

### 📜 License

MIT