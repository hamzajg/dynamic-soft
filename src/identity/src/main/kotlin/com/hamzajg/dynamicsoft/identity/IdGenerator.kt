package com.hamzajg.dynamicsoft.identity

import java.util.concurrent.atomic.AtomicLong

object IdGenerator {
    private val threadLocalCounter = ThreadLocal.withInitial { AtomicLong(0) }
    fun nextId(): Long {
        val counter = threadLocalCounter.get()
        return counter.incrementAndGet()
    }
    fun generatedId(): Long {
        val counter = threadLocalCounter.get()
        return counter.getPlain()
    }
}