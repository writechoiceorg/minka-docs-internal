
# Aliases

## Overview

An **Alias** is a core concept within the Minka Ledger used to create a simple, user-friendly nickname to store the payment information required to complete a transaction.

This concept enables participants, such as banks or financial institutions, to input a key and receive the necessary account details without having to manage complex data lookups themselves.

## Components of an Alias

An Alias record is composed of two primary parts: the `Alias Key` and the `Payment Credential`.

### Alias Key

The **Alias Key** is the public, user-friendly identifier that you use to look up the Alias record.

> [!NOTE]
> Alias keys are typically real-world identifiers, such as email addresses or phone numbers.

### Payment Credential

The **Payment Credential** is the set of private financial information required to execute a payment. This credential is the target data returned when you successfully look up an Alias Key.

Examples of data in a Payment Credential include an account number or a routing code.

## Alias Workflow

The Alias concept enables a two-step process for payments. This separates the act of *finding* payment information from the act of *using* it.

1.  **Lookup:** Your application sends a request to the Minka ledger using a known Alias Key.
2.  **Resolution:** The system finds the matching Alias record and returns the corresponding Payment Credential. Your application can then display these details to the user for confirmation.
3.  **Payment:** Your application uses the retrieved Payment Credential to send a separate request to finalize the payment.

> [!NOTE]
> Because the lookup and payment steps are separate, you are not tied to a specific payment system.  
> You can use the retrieved credential to make a transaction within Minka or in an external system (e.g., Transfiya).

## Related Concepts

* **Anchors:** [Learn about Anchors and how they represent external accounts.](./anchors-concept)
* **Signers:** [Learn about Signers and the basic security concept needed for authenticating to the system and cryptographically signing requests.] (content/docs/signers-concept.md# Signers

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

## Signing Workflow: Authentication vs. Authorization

**Signer** is the identity you assume when authenticating and signing requests to the Ledger APIs. This role ensures that every interaction is both secure and verifiable.

It is critical to understand the two-step process the Ledger uses when it receives your signed request.

### 1. Authentication

First, you use your **private key** to generate a unique digital signature for your request.

When the Ledger receives the request, it uses your public key to perform **authentication**. It validates the signature to prove two things:
1.  The request was signed by the holder of the matching private key.
2.  The request data has not been altered.

### 2. Authorization

Once you are authenticated, the Ledger performs **authorization**.

It checks if your Signer has the necessary permissions to perform the requested operation. These permissions are defined by two other Minka concepts:

* **Policies:** These are the rules that define *what* actions are allowed (e.g., "can create a wallet," "can transfer funds").
* **Circles:** These are groups that link Signers to specific Policies.

Your request is only accepted if your signature is valid (authentication) **and** your Signer is part of a Circle that has a Policy granting permission for the action (authorization).

## Related Concepts

* **Anchors:** [Learn about Anchors and how they represent external accounts.](./anchors-concept)
* **Signers:** [Learn about signing and the basic security concept needed for authenticating to the system and cryptographically signing requests.](./signers-concept) 
