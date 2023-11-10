package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.marketplace.application.AddSolutionDetailsCommand
import com.hamzajg.dynamicsoft.marketplace.SolutionDetails

class AddDetailsToSolutionUseCase {
    fun execute(command: AddSolutionDetailsCommand) {
        command.solution.addDetails(SolutionDetails(command.longDescription))
    }

}
