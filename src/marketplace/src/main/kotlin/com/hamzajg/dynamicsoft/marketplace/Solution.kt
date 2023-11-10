package com.hamzajg.dynamicsoft.marketplace

import com.hamzajg.dynamicsoft.application.EventBus
import java.util.*

class Solution private constructor(
    val id: UUID, val name: String, val description: String,
    logoUrl: String, tags: Array<String>, version: String, price: Money
) {
    private lateinit var details: SolutionDetails

    fun longDescription(): String {
        return details.longDescription
    }

    fun addDetails(solutionDetails: SolutionDetails) {
        details = solutionDetails
        EventBus.publish(SolutionDetailsAddedEvent(solutionId = id, detailsLongDescription = details.longDescription))
    }

    companion object {
        fun of(
            name: String,
            description: String,
            logoUrl: String,
            tags: Array<String>,
            version: String,
            price: Money
        ): Solution {
            return Solution(UUID.randomUUID(), name, description, logoUrl, tags, version, price)
        }
    }

}
