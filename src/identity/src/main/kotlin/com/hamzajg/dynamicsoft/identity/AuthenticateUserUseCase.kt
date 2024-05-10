package com.hamzajg.dynamicsoft.identity

import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class AuthenticateUserUseCase(private val userRepository: UserRepository) {
    fun execute(username: String, password: String): User? {
        val user = userRepository.findByUsername(username)
        return if (user?.password == password) user else null
    }

}
