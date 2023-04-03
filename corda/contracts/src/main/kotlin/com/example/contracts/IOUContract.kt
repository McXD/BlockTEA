package com.example.contracts

import net.corda.core.contracts.CommandData
import net.corda.core.contracts.Contract
import net.corda.core.transactions.LedgerTransaction

class IOUContract : Contract {
    companion object {
        const val ID = "com.example.contracts.IOUContract"
    }

    interface Commands : CommandData {
        class Issue : Commands
        class Settle : Commands
    }

    override fun verify(tx: LedgerTransaction) {
        // Implementation of the contract rules.
    }
}
