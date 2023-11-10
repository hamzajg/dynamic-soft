package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.application.Command
import java.util.UUID

data class PurchaseSolutionCommand(val solutionId: UUID) : Command
