package com.hamzajg.dynamicsoft.identity

import io.quarkus.test.junit.QuarkusTest
import io.restassured.RestAssured
import io.restassured.http.ContentType
import org.junit.jupiter.api.Test

@QuarkusTest
open class IdentityResourceTest {
    @Test
    fun testRegisterUserEndpoint() {
        val requestBody = """
            {
                "username": "testUser",
                "password": "testPassword",
                "email": "test@example.com",
                "firstName": "John",
                "lastName": "Doe"
            }
        """.trimIndent()

        RestAssured.given()
            .contentType(ContentType.JSON)
            .body(requestBody)
            .post("api/identity/register")
            .then()
            .statusCode(201)
            .header("Location", "http://localhost:8081/api/users/1")
    }
}