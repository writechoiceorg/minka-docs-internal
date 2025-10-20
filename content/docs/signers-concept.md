# Signers

## Overview

A Signer represents any entity (you, your system, or your client) that is authorized to submit operations to the Ledger.

In practice, a Signer is defined by a **cryptographic key pair**. 

The process of signing requests ensures that the system can verify the source and integrity of every operation, and it is essential for providing the Ledger's core security layer and complete auditability for financial systems.

## Why Signing Matters

The Ledger is designed as a secure, auditable environment for financial data. To preserve this integrity, every operation must be signed.

* **Authentication & Integrity:** The cryptographic signature proves who sent the request and guarantees that the request payload (e.g., payment amount, destination) has not been tampered with.
  
* **Auditability & Non-Repudiation:** Because every successful operation is tied to a verified Signer, the Ledger maintains a complete, immutable audit trail. This creates **non-repudiation**: a Signer cannot deny having performed an action.

> [!WARNING]
> The Ledger **will reject** any request that is not signed by an authorized Signer. This is a fundamental security control.

## Signing Workflow

**Signer** is the identity you assume when authenticating and signing requests to the Ledger APIs. This role ensures that every interaction is both secure and verifiable.

- Authentication: First, you authenticate with the system to prove your identity.

- Request Signing: Next, you sign the request payload. This digital signature guarantees that the request originates from you and has not been altered in transit.

- Verification: The Ledger then validates the signature against your authenticated identity. If the verification succeeds, the operation proceeds; if it fails, the request is rejected.

It is critical to understand the two-step process the Ledger uses when it receives your signed request.

### Authentication vs. Authorization

#### 1. Authentication

First, you use your **private key** to generate a unique digital signature for your request.

When the Ledger receives the request, it uses your public key to perform **authentication**. It validates the signature to prove two things:
1.  The request was signed by the holder of the matching private key.
2.  The request data has not been altered.

#### 2. Authorization

Once you are authenticated, the Ledger performs **authorization**.

It checks if your Signer has the necessary permissions to perform the requested operation. These permissions are defined by two other Minka concepts:

* **Policies:** These are the rules that define *what* actions are allowed (e.g., "can create a wallet," "can transfer funds").
* **Circles:** These are groups that link Signers to specific Policies.

Your request is only accepted if your signature is valid (authentication) **and** your Signer is part of a Circle that has a Policy granting permission for the action (authorization).

## Related Concepts

* **Aliases:** [Learn how Aliases link user-friendly keys to Anchors.](./aliases-concept.md)
* **Anchors:** [Learn about Anchors and how they represent external accounts.](./anchors-concept.md)
