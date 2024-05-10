package com.hamzajg.dynamicsoft.identity

class MySqlUserRepository : UserRepository {

    override fun addUser(user: User): User {
        throw NotImplementedError("Not implemented")
    }

    override fun findByUsername(username: String): User? {
        throw NotImplementedError("Not implemented")
    }
}