package com.hamzajg.dynamicsoft.identity

import io.smallrye.jwt.build.Jwt
import jakarta.enterprise.context.ApplicationScoped
import org.eclipse.microprofile.jwt.Claims
import java.net.InetAddress

@ApplicationScoped
class UserService(
    private val registerUserUseCase: RegisterUserUseCase,
    private val authenticateUserUseCase: AuthenticateUserUseCase
) {

    fun register(user: User): User {
        return registerUserUseCase.execute(user)
    }

    fun authenticate(username: String, password: String): AccessToken? {
        val user = authenticateUserUseCase.execute(username, password) ?: throw NoSuchElementException("No user found with username: $username")
        val token = generateToken(user)
        return AccessToken(token)
    }

    private fun generateToken(user: User): String {
        val token = Jwt.issuer("https://${InetAddress.getLocalHost().hostName}/issuer")
            .upn(user.username)
            .claim(Claims.sub, user.id)
            .sign()
        return token
    }
}
