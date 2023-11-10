package com.hamzajg.dynamicsoft.application

object EventBus {
    private val subscribers = mutableListOf<(Any) -> Unit>()

    fun subscribe(subscriber: (Any) -> Unit) {
        subscribers.add(subscriber)
    }

    fun publish(event: Any) {
        subscribers.forEach { it(event) }
    }
}
