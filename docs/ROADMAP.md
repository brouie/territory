# Roadmap

Ordered next steps for Territory. Complete each phase before moving to the next.

---

## Phase 1: Git and Repo

- [x] Initialize git: `git init`
- [x] Create new GitHub repo (your org/name)
- [x] Add remote: `git remote add origin https://github.com/brouie/territory.git`
- [x] Update README badge URLs: replace `owner/opbnb` with `brouie/territory`
- [x] First commit and push

---

## Phase 2: Contract Deployment

- [ ] Deploy contracts to opBNB testnet (FeeCollector, GameMaster, Map, Combat, Spawn, etc.)
- [ ] Record deployed addresses
- [ ] Smoke-test: deposit, move, spawn, attack via cast or script

---

## Phase 3: Webapp Integration

- [ ] Add `webapp/src/lib/contracts.ts`: ABIs and deployed addresses
- [ ] Wire action panel to Map.move, Combat.attack, Spawn.spawn via wagmi
- [ ] Wire player panel to read location, units, gold from contracts
- [ ] Test full flow in browser on testnet

---

## Phase 4: Mainnet and Launch

- [ ] Deploy to opBNB mainnet with production FeeCollector config
- [ ] Update webapp for mainnet
- [ ] Optional: playtests, audit
