# Anchors

## Overview

An **Anchor** is a single, auditable record in the Minka Ledger that registers payment credentials to an alias key

This record is fundamental to the Alias Directory solution, which allows participants to look up payment details using a simple key, enabling the start of a transaction.

## Attributes of an Anchor

Because Anchors store sensitive financial data, they are designed for high-security environments.

* **Secure:** The record holds the specific financial details required for a transaction.
* **Versioned & Auditable:** By using the Ledger, every change to an Anchor is cryptographically signed and versioned, creating an immutable audit trail.

## Components

The Anchor record manages the relationship between the two key pieces of data required for alias resolution:

- The Alias Key
- Payment Credentials

You create an Anchor by sending a request that contains both the `Alias Key` (e.g., email address) and the fields describing the `Payment Credential` (e.g., account details).

## Related Concepts

* **Aliases:** [Learn how Aliases link user-friendly keys to Anchors.](./anchors-concept.md)
* **Signers:** [Learn about signing and the basic security concept needed for authenticating to the system and cryptographically signing requests.](./signers-concept.md) 
