package com.example

import com.example.states.IOUState
import com.fasterxml.jackson.databind.ObjectMapper
import net.corda.core.node.services.Vault.StateStatus
import net.corda.core.node.services.vault.PageSpecification
import net.corda.core.node.services.vault.QueryCriteria
import org.slf4j.LoggerFactory
import org.springframework.amqp.core.Exchange
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct
import javax.annotation.PreDestroy

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
                update.produced.forEach { stateAndRef ->
                    val iouState = stateAndRef.state.data
                    val eventName = if (update.consumed.isEmpty()) "IssueIOU" else "SettleIOU"
                    val event = mapOf(
                        "timestamp" to System.currentTimeMillis() / 1000,
                        "origin" to "corda",
                        "transactionId" to stateAndRef.ref.txhash.toString(),
                        "name" to eventName,
                        "contract" to CONTRACT,
                        "payload" to iouState.toMap()
                    )
                    logger.info("New IOUState detected: $event")
                    // Process the event further

                    rabbitTemplate.convertAndSend(blockchainEventsExchange.name, eventName, objectMapper.writeValueAsString(event))
                    logger.info("Sent to MQ")
                }
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
    return mapOf(
        "linearId" to this.linearId.toString(),
        "lender" to this.lender.name.toString(),
        "borrower" to this.borrower.name.toString(),
        "amount" to this.amount,
        "paidAmount" to this.paidAmount
    )
}
