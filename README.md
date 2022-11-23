# Cloud-Functions

Google Cloud Functions is a serverless execution environment for building and connecting cloud services. With Cloud Functions you write simple, single-purpose functions that are attached to events emitted from your cloud infrastructure and services. Your function is triggered when an event being watched is fired. Your code executes in a fully managed environment. There is no need to provision any infrastructure or worry about managing any servers.

You can set up Cloud Functions to execute in response to various scenarios by specifying a trigger for your function. Triggers can be HTTP(S) requests or one of a number of supported events. This page provides an overview of the triggers supported by Cloud Functions.

Broadly, triggers fall into two categories:

## HTTP triggers 
Which react to HTTP(S) requests, and correspond to HTTP functions.

## Event triggers 
Which react to events within your Google Cloud project, and correspond to event-driven functions.

You specify triggers as part of function deployment. You cannot bind the same function to more than one trigger at a time, but you can have the same event cause multiple functions to execute by deploying multiple functions with the same trigger settings.

