package com.example

import org.springframework.amqp.core.Exchange
import org.springframework.amqp.core.ExchangeBuilder
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class RabbitMqConfig(
    @Value("\${rabbitmq.host}") private val host: String,
    @Value("\${rabbitmq.port}") private val port: Int,
    @Value("\${rabbitmq.username}") private val username: String,
    @Value("\${rabbitmq.password}") private val password: String
) {
    @Bean
    open fun connectionFactory(): CachingConnectionFactory {
        val connectionFactory = CachingConnectionFactory()
        connectionFactory.host = host
        connectionFactory.port = port
        connectionFactory.username = username
        connectionFactory.setPassword(password)
        return connectionFactory
    }

    @Bean
    open fun rabbitTemplate(): RabbitTemplate {
        return RabbitTemplate(connectionFactory())
    }

    @Bean
    open fun blockchainEventsExchange(): Exchange {
        return ExchangeBuilder.fanoutExchange("blockchain-events").durable(false).build()!!
    }
}

