package com.hamzajg.dynamicsoft.identity

interface UserRepository {
    fun addUser(user: User): User
    fun findByUsername(username: String): User?
}