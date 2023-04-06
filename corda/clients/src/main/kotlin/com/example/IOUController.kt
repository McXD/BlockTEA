package com.example

import com.example.flows.IssueIOUFlow
import com.example.flows.SettleIOUFlow
import com.example.states.IOUState
import net.corda.core.contracts.UniqueIdentifier
import net.corda.core.identity.CordaX500Name
import net.corda.core.messaging.startFlow
import net.corda.core.node.services.vault.QueryCriteria
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController


data class IOUResponse(val message: String, val transactionId: String? = null, val linearId: String? = null)
data class IOU(val id: String,
               val lender: String,
               val borrower: String,
               val amount: Int,
               val paidAmount: Int
)

@RestController
@CrossOrigin(origins = ["*"])
class IOUController(private val rpcConnection: NodeRPCConnection) {

    private val proxy = rpcConnection.proxy

    @PostMapping("/iou/issue/{borrower}/{amount}")
    fun issueIOU(@PathVariable("borrower") borrower: String, @PathVariable("amount") amount: Int): ResponseEntity<IOUResponse> {
        val borrowerParty = proxy.wellKnownPartyFromX500Name(CordaX500Name.parse(borrower))
            ?: return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(IOUResponse("Borrower not found."))
        val signedTx = proxy.startFlow(::IssueIOUFlow, borrowerParty, amount).returnValue.get()
        val linearId = signedTx.tx.outputsOfType<IOUState>().single().linearId
        return ResponseEntity.status(HttpStatus.CREATED).body(IOUResponse("IOU issued.", transactionId = signedTx.id.toString(), linearId = linearId.toString()))
    }

    @PostMapping("/iou/settle/{linearId}/{paymentAmount}")
    fun settleIOU(@PathVariable("linearId") linearId: String, @PathVariable("paymentAmount") paymentAmount: Int): ResponseEntity<IOUResponse> {
        val settleIOUFlow = proxy.startFlow(::SettleIOUFlow, UniqueIdentifier.fromString(linearId), paymentAmount).returnValue.get()
        return ResponseEntity.ok(IOUResponse("IOU settled.", transactionId = settleIOUFlow.id.toString(), linearId = linearId))
    }

    @GetMapping("/iou")
    fun getAllIOUs(): ResponseEntity<List<IOU>> {
        val queryCriteria = QueryCriteria.VaultQueryCriteria()
        val iouStates = proxy.vaultQueryByCriteria(queryCriteria, IOUState::class.java).states.map { it.state.data }
        return ResponseEntity.ok(iouStates.map { IOU(it.iouId.toString(), it.lender.name.toString(), it.borrower.name.toString(), it.amount, it.paidAmount) })
    }
}

