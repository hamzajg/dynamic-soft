package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.marketplace.Marketplace
import com.hamzajg.dynamicsoft.marketplace.Solution

class QuerySolutionByIdFromMarketplaceUseCase {
    fun execute(query: SolutionByIdQuery) : Solution {
        return Marketplace.singleInstance().querySolutionById(query.solutionId)
    }

}
