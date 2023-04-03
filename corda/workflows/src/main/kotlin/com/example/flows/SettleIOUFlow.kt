package com.example.flows

import co.paralleluniverse.fibers.Suspendable
import com.example.contracts.IOUContract
import com.example.states.IOUState
import net.corda.core.contracts.Command
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.flows.*
import net.corda.core.node.services.queryBy
import net.corda.core.node.services.vault.QueryCriteria
import net.corda.core.transactions.SignedTransaction
import net.corda.core.transactions.TransactionBuilder
import net.corda.core.utilities.ProgressTracker

@InitiatingFlow
@StartableByRPC
class SettleIOUFlow(private val linearId: UniqueIdentifier, private val paymentAmount: Int) : FlowLogic<SignedTransaction>() {
    companion object {
        object QUERYING_THE_IOU : ProgressTracker.Step("Querying the IOU.")
        object BUILDING_THE_TX : ProgressTracker.Step("Building the transaction.")
        object VERIFYING_THE_TX : ProgressTracker.Step("Verifying the transaction.")
        object SIGNING_THE_TX : ProgressTracker.Step("Signing the transaction.")
        object GATHERING_SIGS : ProgressTracker.Step("Gathering the counterparty's signature.") {
            override fun childProgressTracker() = CollectSignaturesFlow.tracker()
        }

        object FINALISING_THE_TX : ProgressTracker.Step("Finalising the transaction.") {
            override fun childProgressTracker() = FinalityFlow.tracker()
        }

        fun tracker() = ProgressTracker(
            QUERYING_THE_IOU,
            BUILDING_THE_TX,
            VERIFYING_THE_TX,
            SIGNING_THE_TX,
            GATHERING_SIGS,
            FINALISING_THE_TX
        )
    }

    override val progressTracker = tracker()

    @Suspendable
    override fun call(): SignedTransaction {
        progressTracker.currentStep = QUERYING_THE_IOU
        val queryCriteria = QueryCriteria.LinearStateQueryCriteria(linearId = listOf(linearId))
        val iouStateAndRef = serviceHub.vaultService.queryBy<IOUState>(queryCriteria).states.singleOrNull()
            ?: throw FlowException("IOU with linear ID $linearId not found.")
        val inputIOUState = iouStateAndRef.state.data

        progressTracker.currentStep = BUILDING_THE_TX
        val notary = iouStateAndRef.state.notary
        val paidAmount = inputIOUState.paidAmount + paymentAmount
        val outputIOUState = IOUState(inputIOUState.iouId, inputIOUState.lender, inputIOUState.borrower, inputIOUState.amount, paidAmount, linearId, inputIOUState.participants)
        val settleCommand = Command(IOUContract.Commands.Settle(), inputIOUState.participants.map { it.owningKey })

        val txBuilder = TransactionBuilder(notary)
            .addInputState(iouStateAndRef)
            .addOutputState(outputIOUState, IOUContract.ID)
            .addCommand(settleCommand)

        progressTracker.currentStep = VERIFYING_THE_TX
        txBuilder.verify(serviceHub)

        progressTracker.currentStep = SIGNING_THE_TX
        val signedTx = serviceHub.signInitialTransaction(txBuilder)

        progressTracker.currentStep = GATHERING_SIGS
        val borrowerSession = initiateFlow(inputIOUState.borrower)
        val fullySignedTx = subFlow(CollectSignaturesFlow(signedTx, listOf(borrowerSession), GATHERING_SIGS.childProgressTracker()))

        progressTracker.currentStep = FINALISING_THE_TX
        return subFlow(FinalityFlow(fullySignedTx, FINALISING_THE_TX.childProgressTracker()))
    }
}

@InitiatedBy(SettleIOUFlow::class)
class SettleIOUFlowResponder(private val session: FlowSession) : FlowLogic<Unit>() {
    @Suspendable
    override fun call() {
        val signedTransactionFlow = object : SignTransactionFlow(session) {
            override fun checkTransaction(stx: SignedTransaction) {
                // Add custom verification logic here, if needed
            }
        }
        val expectedTxId = subFlow(signedTransactionFlow).id

        subFlow(ReceiveFinalityFlow(session, expectedTxId))
    }
}