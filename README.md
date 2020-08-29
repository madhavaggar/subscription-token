# Tezos_Subscription_Token
Project for Tezos India Foundation

Proposal is to develop a system similar to a set-it and forget-it subscription-based model token. The suggestion is to mimic the ERC-1337 token. This will allow
users to sign a single off-chain meta transaction that is periodically resubmitted to the blockchain to
create a model. Thus a service is provided to multiple users who decide to avail the service. Once the
subscriber signs off a one-time agreement to sucribe to the service, the subscription is proven valid
using a timestamp. Now the susbscriber is in full control of the subscription. It gives him the power to
revoke the allowance at any time and asks for a pre-approval every time. The terms of the subscription
cannot be changed.
The issues to address here are:

• What happens when the value of the currency of payment, changes?
• Devise a mechanism to update the on-chain subscription and change the value of the
subscription.
• Implement this model for all monthly subscription services.
• One feature to be included which can be adopted from the ERC-735/1056 standards is the
option of shared payments and delegation. Allowing different users to be identified along with
the main subscription holder and allowing for a mechanism of shared payments.
• This shared subscription model is new and mimics Netflix service of multiple viewer accounts
on a single payment account.
• Thus users can stake their claims on different contracts (735) or a single contract can have
multiple delegates(1056).

The Tech-Stack:
• SmartPy
• ConseilJS
• Taquito
