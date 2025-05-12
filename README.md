# 🃏 Royal Bunker

**Royal Bunker** is a Web3-powered tournament poker platform that brings together real-life events and blockchain technology. Founded in Monterrey in 2007 and now reborn, Royal Bunker uses crypto tokens to manage buy-ins, lotes (chip batches), and player logistics — both digitally and IRL.

---

## 🎯 What It Does

- Users register using **email (via Privy)** — no wallet required up front.
- They can **pay the tournament entry fee in Mantle or Arbitrum**, using ETH, USDC, or native tokens.
- After payment is verified (via TX hash or link), they receive **RB tokens** on **Mantle**, representing “lotes” (chip batches).
- During the IRL tournament, players **transfer their RB tokens** to a tournament-specific wallet via a button in the app. The cashier then hands out the corresponding chips.

---

## 🔧 Tech Stack

- **Node** (Frontend)
- **Thirdweb SDK** (email-based wallet onboarding, contract interactions + token transfers)
- **Mantle & Arbitrum** (L2 blockchains)
- **RB Token** – custom ERC20 token deployed on Mantle to represent chip batches

---

## 🌐 Networks

| Network         | Chain ID | Tokens Accepted       |
|----------------|----------|------------------------|
| Mantle         | `5000`   | MNT, ETH, USDC         |
| Arbitrum One   | `42161`  | ARB, ETH, USDC         |

---

## 💰 Token Model

- **1 lote = 333 MXN**
- **Entry = 3 lotes = 999 MXN**
- RB tokens are only issued **on Mantle**
- Users receive RB tokens equivalent to their payment after verification
- These tokens can be used to redeem physical chips at the cashier
