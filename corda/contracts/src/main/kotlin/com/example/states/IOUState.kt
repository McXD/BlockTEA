package com.example.states

import com.example.contracts.IOUContract
import net.corda.core.contracts.BelongsToContract
import net.corda.core.contracts.LinearState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.AbstractParty
import net.corda.core.identity.Party

@BelongsToContract(IOUContract::class)
data class IOUState(
    val iouId: UniqueIdentifier,
    val lender: Party,
    val borrower: Party,
    val amount: Int,
    val paidAmount: Int,
    override val linearId: UniqueIdentifier = iouId,
    override val participants: List<AbstractParty> = listOf(lender, borrower)
) : LinearState
