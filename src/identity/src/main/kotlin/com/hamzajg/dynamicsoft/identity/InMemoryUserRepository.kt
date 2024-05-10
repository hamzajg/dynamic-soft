package com.hamzajg.dynamicsoft.identity

import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class InMemoryUserRepository : UserRepository {

    private val users = mutableListOf<User>()

    override fun addUser(user: User): User {
        users.add(user)
        return user
    }

    override fun findByUsername(username: String): User? {
        return users.find { it.username == username }
    }
}