package com.hamzajg.dynamicsoft.marketplace.application

import com.hamzajg.dynamicsoft.application.Command
import com.hamzajg.dynamicsoft.application.CommandHandler
import com.hamzajg.dynamicsoft.marketplace.usecases.AddSolutionToMarketplaceUseCase

class AddSolutionToMarketplaceCommandHandler : CommandHandler {
    override fun handle(command: Command) {
        handle(command as AddSolutionCommand)
    }

    private fun handle(command: AddSolutionCommand) {
        AddSolutionToMarketplaceUseCase().execute(command)
    }
}
