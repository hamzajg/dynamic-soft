package com.hamzajg.dynamicsoft.identity

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class IdGeneratorTest {

    @Test
    fun `test nextId generates unique IDs`() {
        val id1 = IdGenerator.nextId()
        val id2 = IdGenerator.nextId()
        val id3 = IdGenerator.nextId()

        Assertions.assertEquals(1, id2 - id1)
        Assertions.assertEquals(1, id3 - id2)
    }

    @Test
    fun `test generatedId returns current value without increment`() {
        val id1 = IdGenerator.nextId()
        val generatedId = IdGenerator.generatedId()

        Assertions.assertEquals(id1, generatedId)
    }
}