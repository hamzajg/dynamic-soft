package com.hamzajg.dynamicsoft.marketplace.application

import com.hamzajg.dynamicsoft.application.Command
import com.hamzajg.dynamicsoft.marketplace.Money

data class AddSolutionCommand (
    val name: String, val description: String, val logoUrl: String,
    val tags: Array<String>, val version: String, val price: Money
) : Command {

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AddSolutionCommand

        if (name != other.name) return false
        if (description != other.description) return false
        if (logoUrl != other.logoUrl) return false
        if (!tags.contentEquals(other.tags)) return false
        if (version != other.version) return false
        if (price != other.price) return false

        return true
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + description.hashCode()
        result = 31 * result + logoUrl.hashCode()
        result = 31 * result + tags.contentHashCode()
        result = 31 * result + version.hashCode()
        result = 31 * result + price.hashCode()
        return result
    }
}