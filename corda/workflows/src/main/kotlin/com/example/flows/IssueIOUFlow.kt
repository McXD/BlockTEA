package com.example.flows

import co.paralleluniverse.fibers.Suspendable
import com.example.contracts.IOUContract
import com.example.states.IOUState
import net.corda.core.contracts.Command
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.identity.Party
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker

@InitiatingFlow
@StartableByRPC
class IssueIOUFlow(private val borrower: Party, private val amount: Int) : FlowLogic<SignedTransaction>() {
    companion object {
        object GENERATING_TRANSACTION : ProgressTracker.Step("Generating transaction.")
        object VERIFYING_TRANSACTION : ProgressTracker.Step("Verifying transaction.")
        object SIGNING_TRANSACTION : ProgressTracker.Step("Signing transaction.")
        object GATHERING_SIGS : ProgressTracker.Step("Gathering counterparty signature.") {
            override fun childProgressTracker() = CollectSignaturesFlow.tracker()
        }

        object FINALISING_TRANSACTION : ProgressTracker.Step("Finalising transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        fun tracker() = ProgressTracker(
            GENERATING_TRANSACTION,
            VERIFYING_TRANSACTION,
            SIGNING_TRANSACTION,
            GATHERING_SIGS,
            FINALISING_TRANSACTION
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call(): SignedTransaction {
        val notary = serviceHub.networkMapCache.notaryIdentities.first()
        val iouState = IOUState(
            iouId = UniqueIdentifier(),
            lender = ourIdentity,
            borrower = borrower,
            amount = amount,
            paidAmount = 0
        )

        progressTracker.currentStep = GENERATING_TRANSACTION
        val issueCommand = Command(IOUContract.Commands.Issue(), iouState.participants.map { it.owningKey })
        val txBuilder = TransactionBuilder(notary)
            .addOutputState(iouState, IOUContract.ID)
            .addCommand(issueCommand)

        progressTracker.currentStep = VERIFYING_TRANSACTION
        txBuilder.verify(serviceHub)

        progressTracker.currentStep = SIGNING_TRANSACTION
        val signedTx = serviceHub.signInitialTransaction(txBuilder)

        progressTracker.currentStep = GATHERING_SIGS
        val borrowerSession = initiateFlow(borrower)
        val fullySignedTx = subFlow(CollectSignaturesFlow(signedTx, listOf(borrowerSession), GATHERING_SIGS.childProgressTracker()))

        progressTracker.currentStep = FINALISING_TRANSACTION
        return subFlow(FinalityFlow(fullySignedTx, FINALISING_TRANSACTION.childProgressTracker()))
    }
}

@InitiatedBy(IssueIOUFlow::class)
class IssueIOUFlowResponder(private val session: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        val signedTransactionFlow = object : SignTransactionFlow(session) {
            override fun checkTransaction(stx: SignedTransaction) {
                // Custom verification logic
            }
        }
        subFlow(signedTransactionFlow)
    }
}
