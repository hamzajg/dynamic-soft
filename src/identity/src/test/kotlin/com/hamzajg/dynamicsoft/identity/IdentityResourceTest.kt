package com.hamzajg.dynamicsoft.identity

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured
import io.restassured.http.ContentType
import org.hamcrest.CoreMatchers.containsString
import org.hamcrest.CoreMatchers.equalTo
import org.hamcrest.CoreMatchers.startsWith
import org.junit.jupiter.api.Test

@QuarkusTest
open class IdentityResourceTest {

    private fun registerBody(username: String, password: String) = """
        {
            "username": "$username",
            "password": "$password",
            "email": "$username@example.com",
            "firstName": "John",
            "lastName": "Doe"
        }
    """.trimIndent()

    private fun loginBody(username: String, password: String) = """
        {
            "username": "$username",
            "password": "$password"
        }
    """.trimIndent()

    private fun register(username: String, password: String) =
        RestAssured.given()
            .contentType(ContentType.JSON)
            .body(registerBody(username, password))
            .post("api/identity/register")

    @Test
    fun testRegisterUserEndpoint() {
        register("testUser", "testPassword")
            .then()
            .statusCode(201)
            // The generated id depends on how many users the shared in-memory
            // repository has already seen, so only the shape is asserted here.
            .header("Location", startsWith("http://localhost:8081/api/users/"))
    }

    @Test
    fun testRegisterDuplicateUsernameReturns409() {
        val username = "duplicateUser"
        register(username, "testPassword").then().statusCode(201)

        register(username, "testPassword")
            .then()
            .statusCode(409)
            .body("message", containsString(username))
    }

    @Test
    fun testLoginWithUnknownUserReturns401() {
        RestAssured.given()
            .contentType(ContentType.JSON)
            .body(loginBody("nobody", "whatever"))
            .post("api/identity/login")
            .then()
            .statusCode(401)
            .body("message", equalTo("Invalid username or password"))
    }

    @Test
    fun testLoginWithWrongPasswordReturns401() {
        val username = "wrongPasswordUser"
        register(username, "correctPassword").then().statusCode(201)

        RestAssured.given()
            .contentType(ContentType.JSON)
            .body(loginBody(username, "wrongPassword"))
            .post("api/identity/login")
            .then()
            .statusCode(401)
            .body("message", equalTo("Invalid username or password"))
    }
}
