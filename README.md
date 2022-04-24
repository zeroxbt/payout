# Payout

Payout completed (and active) jobs automatically.

## Disclaimers

- The list of offers is taken from othub. If for some reason othub is down, the program won't work.
- Othub is fairly slow at updating data. If for some reason the script throws an error, <b>wait at least 15 minutes before running it again</b>. It could happen that the script payed out a job, but othub hasn't updated, so the script will try to payout again.

## Setup

Create a .env file with the parameters specified in .env-example.

Add RPCs in config.json. There are a few free rpcs that don't require making accounts :

- polygon :
  - https://polygon-rpc.com/
- gnosis (previously xdai) :
  - https://rpc.xdaichain.com/ 

I would suggest to create free private rpcs though as in my experience they are faster and more reliable :

- polygon :
  - https://www.alchemy.com/
- gnosis :
  - https://getblock.io/
- ethereum :
  - https://infura.io/

Install dependencies before running :

```sh
npm install
```

## How to run

```sh
npm start
```
