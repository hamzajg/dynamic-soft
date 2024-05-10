package com.hamzajg.dynamicsoft.identity

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrowsExactly
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class UserServiceTest {

    private lateinit var userRepository:InMemoryUserRepository
    private lateinit var userService:UserService

    @BeforeEach
    fun setup() {
        userRepository = InMemoryUserRepository()
        userService = UserService(RegisterUserUseCase(userRepository), AuthenticateUserUseCase(userRepository))
    }

    @Test
    fun testRegister() {
        val user = User("testUser", "testPassword","test@email.com",
            "testFirstName", "testLastName")

        val registeredUser = userService.register(user)
        assertEquals(user, registeredUser)
    }

    @Test
    fun testRegisterExistingUser() {
        val user = User(IdGenerator.nextId(), "testUser", "testPassword","test@email.com",
            "testFirstName", "testLastName")
        userService.register(user)

        assertThrowsExactly(IllegalArgumentException::class.java) {
            userService.register(user)
        }
    }

    @Test
    fun testAuthenticate() {
        val user = User("testUser", "testPassword","test@email.com",
            "testFirstName", "testLastName")

        val authenticatedUser = userService.authenticate(user.username, user.password)
        assertEquals(user, authenticatedUser)
    }

    @Test
    fun testAuthenticateInvalidPassword() {
        val user = User(IdGenerator.nextId(), "testUser", "testPassword","test@email.com",
            "testFirstName", "testLastName")

        assertThrowsExactly(NoSuchElementException::class.java) {
            userService.authenticate(user.username, "wrongPassword")
        }
    }
}
