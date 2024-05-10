package com.hamzajg.dynamicsoft.identity

import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.ws.rs.Consumes
import jakarta.ws.rs.POST
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.Context
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.core.SecurityContext
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.media.Content
import org.eclipse.microprofile.openapi.annotations.media.Schema
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import java.net.URI

@Path("/api/identity")
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
class IdentityResource @Inject constructor (private val service: UserService) {

    @POST
    @Path("/register")
    @Operation(summary = "Register a new user", description = "")
    @APIResponses(value = [
        APIResponse(responseCode = "201", description = "User registered successfully"),
        APIResponse(responseCode = "400", description = "Bad request - Invalid input")
    ])
    fun register(@RequestBody(description = "" , required=true) body: RegisterUserRequest, @Context securityContext: SecurityContext) : Response {
        val user = service.register(User(body.username, body.password, body.email, body.firstName, body.lastName))
        return Response.status(Response.Status.CREATED).location(URI("api/users/${user.id}")).build()
    }

    @POST
    @Path("/login")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Log in a user", description = "")
    @APIResponses(value = [
        APIResponse(responseCode = "200", description = "Successful login", content = [Content(mediaType = "application/json", schema = Schema(implementation = Response::class))]),
        APIResponse(responseCode = "401", description = "Unauthorized - Invalid credentials")])
    fun login(@RequestBody(description = "" , required=true) body: LoginUserRequest, @Context securityContext: SecurityContext) : Response
    {
        val accessToken = service.authenticate(body.username, body.password)
        return Response.ok(accessToken).build()
    }
}
