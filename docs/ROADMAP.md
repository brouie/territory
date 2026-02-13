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

- [x] Deploy contracts to opBNB testnet (FeeCollector, GameMaster, Map, Garrison, Combat, Spawn, etc.)
- [x] Record deployed addresses
- [x] Lower fees via SetTestnetFees (Move/Spawn 0.00001, Attack 0.00005)

**Testnet deploy:** `cd contracts` then set `PRIVATE_KEY`, `TESTNET=1`, `RPC_URL`, then run `forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast`. See `contracts/README.md`.

---

## Phase 3: Webapp Integration

- [x] Add `webapp/src/lib/contracts.ts`: ABIs and deployed addresses
- [x] Wire Deposit, Spawn, Move, Fortify, Attack via wagmi
- [x] Thematic map with ownership and power display
- [x] Fortify action for PVP defense

**Note:** No private key in frontend. Users connect via MetaMask. Override addresses via NEXT_PUBLIC_* in `.env.local` (gitignored).

---

## Phase 4: Mainnet and Launch

- [ ] Deploy to opBNB mainnet with production FeeCollector config
- [ ] Update webapp for mainnet
- [ ] Optional: playtests, audit

---

## Future Incentives

Currently no explicit player payouts; fees split 70% treasury, 30% CL8Y buy-and-burn. Planned for mainnet:

- **Treasury rewards** – Share of fees distributed to top players (e.g. weekly by territory held or PVP wins)
- **Hold rewards** – Small Gold or token drip for holding locations over time
- **PVP bounties** – Bonus for capturing locations owned by other players
- **Tournaments** – Prize pools from treasury or sponsors
- **Seasonal rewards** – Token airdrops or special items for active players
