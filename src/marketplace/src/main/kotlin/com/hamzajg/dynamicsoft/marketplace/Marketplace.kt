package com.hamzajg.dynamicsoft.marketplace

import com.hamzajg.dynamicsoft.application.EventBus
import java.util.UUID

class Marketplace {
    private val solutions: Map<UUID, Solution> = mutableMapOf()

    fun addSolution(solutionToAdd: Solution) {
        (solutions as MutableMap)[solutionToAdd.id] = solutionToAdd
        EventBus.publish(SolutionAddedEvent(solutionId = solutionToAdd.id, solutionName = solutionToAdd.name, solutionDescription = solutionToAdd.description))
    }

    fun querySolutionById(solutionId: UUID): Solution {
        return solutions[solutionId]!!
    }

    companion object {
        private val instance: Marketplace = Marketplace()
        fun singleInstance(): Marketplace {
            return this.instance
        }
    }

}
