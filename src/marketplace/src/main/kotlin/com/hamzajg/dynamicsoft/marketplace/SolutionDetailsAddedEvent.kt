package com.hamzajg.dynamicsoft.marketplace

import com.hamzajg.dynamicsoft.application.DomainEvent
import java.util.*

data class SolutionDetailsAddedEvent(val solutionId: UUID, val detailsLongDescription: String) : DomainEvent
