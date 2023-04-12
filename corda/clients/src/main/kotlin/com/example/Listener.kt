package com.example

import com.example.states.IOUState
import com.fasterxml.jackson.databind.ObjectMapper
import net.corda.core.node.services.Vault.StateStatus
import net.corda.core.node.services.vault.PageSpecification
import net.corda.core.node.services.vault.QueryCriteria
import org.slf4j.LoggerFactory
import org.springframework.amqp.core.Exchange
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy

@Profile("listening")
@Component
class Listener(
    private val rpcConnection: NodeRPCConnection,
    private val rabbitTemplate: RabbitTemplate,
    private val blockchainEventsExchange: Exchange
) {
    companion object {
        private val objectMapper = ObjectMapper()
        private val logger = LoggerFactory.getLogger(Listener::class.java)
        private val CONTRACT = mapOf(
            "name" to "IOU"
        )
    }

    private val proxy = rpcConnection.proxy

    @PostConstruct
    fun startListening() {
        logger.info("Start listening to IOU events")
        // Query criteria to listen for updates on the IOUState
        val criteria = QueryCriteria.VaultQueryCriteria(
            status = StateStatus.UNCONSUMED,
            contractStateTypes = setOf(IOUState::class.java)
        )

        // Fetch vault data and updates
        val (_, updates) = proxy.vaultTrackByWithPagingSpec(
            IOUState::class.java,
            criteria,
            PageSpecification(1, 1) // Dummy page specification for getting updates only
        )

        // Subscribe to the vault updates
        updates.subscribe(
            { update ->
                val consumedStateAndRef = update.consumed.singleOrNull()
                val producedStateAndRef = update.produced.single()

                val consumedIOUState = consumedStateAndRef?.state?.data
                val producedIOUState = producedStateAndRef.state.data

                val eventName = if (consumedIOUState == null) "IssueIOU" else "SettleIOU"
                val event = mutableMapOf(
                    "timestamp" to System.currentTimeMillis() / 1000,
                    "origin" to "corda",
                    "transactionId" to producedStateAndRef.ref.txhash.toString(),
                    "name" to eventName,
                    "contract" to CONTRACT,
                    "payload" to producedIOUState.toMap()
                )

                if (consumedIOUState != null) {
                    val paymentAmount = producedIOUState.paidAmount - consumedIOUState.paidAmount
                    val payload = event["payload"] as MutableMap<String, Any>
                    payload["incrementalPayment"] = paymentAmount
                }


                logger.info("New IOUState detected: $event")
                // Process the event further

                rabbitTemplate.convertAndSend(blockchainEventsExchange.name, eventName, objectMapper.writeValueAsString(event))
                logger.info("Sent to MQ")
            },
            { error ->
                logger.error("Error in vault updates subscription: $error")
            }
        )

    }

    @PreDestroy
    fun stopListening() {
        // Nothing to do, the RPC connection will be closed by NodeRPCConnection's PreDestroy method.
    }
}

fun IOUState.toMap(): Map<String, Any> {
    val map = mutableMapOf(
        "linearId" to this.linearId.toString(),
        "lender" to this.lender.name.toString(),
        "borrower" to this.borrower.name.toString(),
        "amount" to this.amount,
        "paidAmount" to this.paidAmount
    )

    return map
}
