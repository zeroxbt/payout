# Payout

Payout completed (and active) jobs automatically.

## Disclaimers

- ETH PAYOUTS HAVEN'T BEEN TESTED, THE PROGRAM COULD EMPTY YOUR ETH WALLET
- The list of offers is taken from othub. If for some reason othub is down, the program won't work.
- Othub is fairly slow at updating data. If for some reason the script throws an error, <b>wait at least 15 minutes before running it again</b>. It could happen that the script payed out a job, but othub hasn't updated, so the script will try to payout again.

## Setup

Create a wallets.json file with the parameters specified in wallets-example.json. You can input as many nodes as you want.

(optional) If you want the script to also payout active jobs, set payoutOnlyCompleted in config.json

(optional) If you want to disable payouts for certain blockchains, set the "enabled" property to false in config.json

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
