# Contents

- [What is this?](#what-is-this)
- [Installation and Running](#installation-and-running)
- [Rest api examples](#rest-api-examples)
- [How it's structured](#how-it's-structured)

# What is this?

Example of using redis queue, socket and puppeteer together for a scalable scraper.

The redis queue is perfect to talk between servers and processes, however it lacked one thing we wanted. Which is the ability to freely talk to the actual process, change directions and close process manually.

# Installation and Running

- You need NodeJS version 8 or above, and probably `pm2` if you like to use the process manager.
- Change details on the `app/config.js` file.
- Install dependencies, `yarn`.
- Run the development version, `yarn run dev`.
- Open browser and give appropriate commands.

# Rest api examples

# How it's structured

The complete project resides on `app` folder. Just to make things a bit clear on the project root.

The `queue-master` and `queue-worker` is part of a redis based simple queue.

Master exposes a REST api, which can be used to add new jobs to client, or give additional commands.

The `scraper` is a part of the `queue-worker` however it's also a big part, so kept outside to make things easier to overview.

- **config.js**: Basic configuration, required by the other parts and probably becomes a global
- **queue-master**:
  - index.js
  - controllers
  - modules
- **queue-worker**:
  - index.js
  - socket.js
- **scraper**:
  - index.js
  - hooks
