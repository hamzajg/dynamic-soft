package com.hamzajg.dynamicsoft.marketplace

import com.hamzajg.dynamicsoft.application.DomainEvent
import java.util.UUID

data class SolutionAddedEvent(
    val id: UUID = UUID.randomUUID(),
    val solutionId: UUID,
    val solutionName: String,
    val solutionDescription: String
) : DomainEvent
