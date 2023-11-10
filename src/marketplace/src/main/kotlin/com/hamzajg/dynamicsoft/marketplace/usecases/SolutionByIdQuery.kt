package com.hamzajg.dynamicsoft.marketplace.usecases

import com.hamzajg.dynamicsoft.application.Query
import java.util.*

data class SolutionByIdQuery(val solutionId: UUID) : Query