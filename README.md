# Counseling Book Tags

## Overview
Counseling Book Tags is a web application that allows users to access information from a public book API, coupled with custom user-defined tags and comments that describe different counseling topics displayed in each tagged book. The application is built using Node.js and Express along with a MongoDB database.

## Building Process

This application was built using an API-first approach and an MVC architecture patter *(where possible)*. This meant first planning out the structure of the API before building the rest of the application around this initial structure. Another key element of this type of design is clear API documentation. I intentionally constructed a JSON response at the `/api/v1` that describes for a user *(or developer)* exactly what endpoints are available, their uses, and expected response structures. Designing an API before the UI is also helpful because I can be intentional to only return the data I will need in the application, doing so in an easy to navigate structure. This will allow consumption of these API endpoints to be even easier later on in the development process, and as the application grows in the future! 