package com.hamzajg.dynamicsoft.marketplace.application

import com.hamzajg.dynamicsoft.marketplace.Solution

data class AddSolutionDetailsCommand(val solution: Solution, val longDescription: String)
