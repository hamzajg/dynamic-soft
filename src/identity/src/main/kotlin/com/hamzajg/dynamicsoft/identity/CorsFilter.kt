package com.hamzajg.dynamicsoft.identity

import jakarta.ws.rs.container.ContainerRequestContext
import jakarta.ws.rs.container.ContainerRequestFilter
import jakarta.ws.rs.container.ContainerResponseContext
import jakarta.ws.rs.container.ContainerResponseFilter
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.Provider
import java.lang.reflect.Type
import jakarta.ws.rs.container.PreMatching

// The React dev app (http://localhost:3000) calls this service cross-origin.
// Quarkus 3.5's quarkus.http.cors.* keys are not recognized by this build, so
// CORS is handled here instead.
@Provider
@PreMatching
class CorsFilter : ContainerRequestFilter, ContainerResponseFilter {

    override fun filter(requestContext: ContainerRequestContext) {
        if (requestContext.method == "OPTIONS") {
            requestContext.abortWith(Response.ok().build())
        }
    }

    override fun filter(requestContext: ContainerRequestContext, responseContext: ContainerResponseContext) {
        val headers = responseContext.headers
        headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
        headers.add("Access-Control-Allow-Headers", "accept,authorization,content-type,x-requested-with")
        headers.add("Access-Control-Allow-Credentials", "true")
    }
}
