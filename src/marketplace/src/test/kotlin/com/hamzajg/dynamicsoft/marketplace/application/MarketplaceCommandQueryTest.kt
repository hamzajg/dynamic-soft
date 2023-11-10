package com.hamzajg.dynamicsoft.marketplace.application

import com.hamzajg.dynamicsoft.application.DomainEvent
import com.hamzajg.dynamicsoft.application.EventBus
import com.hamzajg.dynamicsoft.marketplace.Money
import com.hamzajg.dynamicsoft.marketplace.SolutionAddedEvent
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class MarketplaceCommandQueryTest {
    private lateinit var eventCapture: MutableList<DomainEvent>

    @BeforeEach
    fun setup() {
        eventCapture = mutableListOf()
        EventBus.subscribe { event -> eventCapture.add(event as DomainEvent) }
        AddSolutionToMarketplaceCommandHandler().handle(
            AddSolutionCommand(
                "Eshop", "E-Commerce", "logo.png",
                arrayOf("Java", "EShop", "E Commerce"), "1.0.0", Money(1000.0, "DTN")
            )
        )
    }

    @Test
    fun `can handle add solution project command`() {
        assertEquals(1, eventCapture.size)
        Assertions.assertNotNull((eventCapture[0] as SolutionAddedEvent).id)
        Assertions.assertNotNull((eventCapture[0] as SolutionAddedEvent).solutionId)
        assertEquals("Eshop", (eventCapture[0] as SolutionAddedEvent).solutionName)
        assertEquals("E-Commerce", (eventCapture[0] as SolutionAddedEvent).solutionDescription)
    }
}