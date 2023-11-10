package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.application.DomainEvent
import com.hamzajg.dynamicsoft.application.EventBus
import com.hamzajg.dynamicsoft.marketplace.*
import com.hamzajg.dynamicsoft.marketplace.application.AddSolutionCommand
import com.hamzajg.dynamicsoft.marketplace.application.AddSolutionDetailsCommand
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class MarketplaceUseCaseTest {
    private lateinit var eventCapture: MutableList<DomainEvent>

    @BeforeEach
    fun setup() {
        eventCapture = mutableListOf()
        EventBus.subscribe { event -> eventCapture.add(event as DomainEvent) }
        AddSolutionToMarketplaceUseCase().execute(
            AddSolutionCommand(
                "Eshop", "E-Commerce", "logo.png",
                arrayOf("Java", "EShop", "E Commerce"), "1.0.0", Money(1000.0, "DTN")
            )
        )
    }

    @Test
    fun `can add new solution project to the marketplace`() {
        assertEquals(1, eventCapture.size)
        assertNotNull((eventCapture[0] as SolutionAddedEvent).id)
        assertNotNull((eventCapture[0] as SolutionAddedEvent).solutionId)
        assertEquals("Eshop", (eventCapture[0] as SolutionAddedEvent).solutionName)
        assertEquals("E-Commerce", (eventCapture[0] as SolutionAddedEvent).solutionDescription)
    }

    @Test
    fun `can query solution project by name from the marketplace`() {
        val result = QuerySolutionByIdFromMarketplaceUseCase().execute(
            SolutionByIdQuery((eventCapture[0] as SolutionAddedEvent).solutionId)
        )

        assertEquals((eventCapture[0] as SolutionAddedEvent).solutionId, result.id)
        assertEquals("Eshop", result.name)
    }

    @Test
    fun `can add new solution project details`() {
        val solution = QuerySolutionByIdFromMarketplaceUseCase().execute(SolutionByIdQuery((eventCapture[0] as SolutionAddedEvent).solutionId))

        AddDetailsToSolutionUseCase().execute(
            AddSolutionDetailsCommand(solution, "Long Description here")
        )
        val result = QuerySolutionByIdFromMarketplaceUseCase().execute(
            SolutionByIdQuery((eventCapture[0] as SolutionAddedEvent).solutionId)
        )

        assertNotNull(result.id)
        assertEquals("Long Description here", result.longDescription())
    }

    @Test
    fun `can purchase solution project from the marketplace`() {
        val solution = QuerySolutionByIdFromMarketplaceUseCase().execute(SolutionByIdQuery((eventCapture[0] as SolutionAddedEvent).solutionId))

        PurchaseSolutionFromMarketplaceUseCase().execute(PurchaseSolutionCommand(solution.id))
    }

}