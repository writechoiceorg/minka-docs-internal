
# Aliases

## Overview

An **Alias** is a core concept within the Minka Ledger used to create a simple, user-friendly nickname to store the payment information required to complete a transaction.

This concept enables participants, such as banks or financial institutions, to input a key and receive the necessary account details without having to manage complex data lookups themselves.

This page explains the components of an Alias and the typical workflow for using one.

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
* **Signers:** [Learn about Signers and the basic security concept needed for authenticating to the system and cryptographically signing requests.] (./signers-concept)
