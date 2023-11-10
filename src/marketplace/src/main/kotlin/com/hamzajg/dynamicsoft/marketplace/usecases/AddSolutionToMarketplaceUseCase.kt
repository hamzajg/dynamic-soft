package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.marketplace.Marketplace
import com.hamzajg.dynamicsoft.marketplace.Solution
import com.hamzajg.dynamicsoft.marketplace.application.AddSolutionCommand

class AddSolutionToMarketplaceUseCase {
    fun execute(command: AddSolutionCommand) {
        Marketplace.singleInstance().addSolution(
            Solution.of(
                command.name, command.description, command.logoUrl, command.tags,
                command.version, command.price
            )
        )
    }

}

