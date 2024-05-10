package com.hamzajg.dynamicsoft.identity

data class User(
    val id: Long?,
    val username: String,
    var password: String,
    val email: String,
    val firstName: String,
    val lastName: String
) {
    constructor(username: String, password: String, email: String, firstName: String, lastName: String) :
            this(IdGenerator.nextId(), username, password, email, firstName, lastName)
}

data class RegisterUserRequest(
    val username: String,
    val password: String,
    val email: String,
    val firstName: String,
    val lastName: String
)
data class LoginUserRequest(
    val username: String,
    val password: String
)