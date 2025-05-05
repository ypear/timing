/*
This utility module provides three helpful time manipulation functions:

nextday(): Takes a date and returns the timestamp for the start (00:00:00) of the next day. If no date 
           is provided, it uses the current time.

nextHour(): Returns a timestamp for the next hour boundary, with special handling:

            - If current minutes are less than 31, it sets to :31 of current hour
            - If current minutes are 31 or greater, it moves to the next hour
            - Handles day rollover when going past 23:00

nextMinute(): Returns a timestamp for the start of the next minute, clearing all seconds and milliseconds.

All functions return timestamps in milliseconds (Unix epoch time) and can work with either a provided date parameter 
or default to the current time if no date is given.

This module is particularly useful for scheduling tasks, setting timeouts, or calculating future time boundaries in 
a clean and consistent way.
*/

module.exports = {
  nextday: function(date) {
    date = new Date(date || (+new Date()));
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0);
    date.setMinutes(0, 0, 0);
    return +new Date(date);
  },
  nextHour: function(date) {
    date = new Date(date || (+new Date()));
    //if (date.getMinutes() < 31) { // for a server
    //  date.setMinutes(31);
    //}
    date.nh = date.getHours() + Math.round(date.getMinutes() / 60);
    if (date.nh > 23) {
      date.setHours(0);
      date.setDate(date.getDate() + 1);
    }
    else {
      date.setHours(date.nh);
    }
    date.setMinutes(0, 0, 0);
    return +new Date(date);
  },
  nextMinute: function(date) {
    date = new Date(date || (+new Date()));
    date.setMinutes(date.getMinutes() + 1);
    date.setSeconds(0, 0);
    return +new Date(date);
  },
  nextSecond: function(date) {
    date = new Date(date || (+new Date()));
    date.setSeconds(date.getSeconds() + 1);
    date.setMilliseconds(0);
    return +new Date(date);
  },
  unixToMilitary: function(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day}/${hours}/${minutes}`;
  },
  militaryToUnix: function(formattedString) {
    const [year, month, day, hours, minutes] = formattedString.split('/');
    return Date.UTC(year, month - 1, day, hours, minutes);
  },
  now: undefined,
  upcomming: [],
  settings: {
    nextDay: 7,
    nextHour: 24,
    nextMinute: 60,
    nextSecond: 60
  },
  /*
  every:

  1. Maintains an array of upcoming timestamps
  2. Fills the queue up to the specified limit based on timing type
  3. Checks if the first upcoming time has passed
  4. When time is reached:
     - Sets the current time
     - Removes it from the queue
     - Executes the callback with a readable timestamp
  This creates a rolling schedule that continuously maintains a queue of future events while executing callbacks at the appropriate times.

  example:

  // Check every 10 seconds for minute tasks
  setInterval(() => {
    timing.every('nextMinute', (timestamp) => {
      console.log('Minute task executed at:', timestamp);
      // Your per-minute tasks here, like:
      // - Update live data
      // - Check user status
      // - Process queued items
      // - Update UI elements
    });
  }, 10000);
  */
  every: function(timing, doSomething) { // todo: add an optional handler?
    while (this.upcomming.length < this.settings[timing]) {
      this.upcomming = this.upcomming.concat([this[timing](this.upcomming[this.upcomming.length - 1])]);
    }
    if (this.upcomming[0] < (+new Date())) {
      this.now = this.upcomming[0];
      this.upcomming = this.upcomming.slice(1);
      doSomething(this.unixToMilitary(this.now));
    }
  },
  checkEvery: function(timing, intervalMs, doSomething) {
    let iv = setInterval(() => {
      this.every(timing, (timestamp) => {
        clearInterval(iv);
        doSomething(timestamp);
      });
    }, intervalMs);
  }
};



/*
The number 31 in the nextHour() function serves a specific scheduling purpose. It creates a mid-hour checkpoint at minute :31 of each hour.

Here's how it works:

If current time is before :31 of the hour (minutes < 31), it sets the time to :31
If current time is :31 or later, it moves to the start of the next hour
This creates two scheduling windows per hour:

First half: Tasks run at :31
Second half: Tasks run at the next hour :00
This pattern is useful for:

Spreading out scheduled tasks across the hour
Creating predictable mid-hour and hour-boundary execution times
Avoiding task clustering at the start/end of hours
The number 31 specifically was chosen as it roughly divides the hour in half, giving balanced scheduling windows of ~30 minutes each.
*/




// todo: ad option military to see if writes happen exactly on the second if not utc