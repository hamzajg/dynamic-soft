package com.hamzajg.dynamicsoft.identity

import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class RegisterUserUseCase(private val userRepository: UserRepository) {
    fun execute(user: User): User {
        val existingUser = userRepository.findByUsername(user.username)
        if (existingUser != null) {
            throw IllegalArgumentException("User with username ${user.username} already exists")
        }
        val encryptedPassword = user.password //passwordEncoder.encode(user.password)
        user.password = encryptedPassword
        return userRepository.addUser(user)
    }

}
