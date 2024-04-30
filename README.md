# Overview
This repo tries to simplify my stack to its bare bones - to try to isolate why my hot reload is no longer working. 

I started using serverless-webpack to bundle my code for deployment because my lambdas had become too big to deploy. Something about my webpack and serverless setup has removed my ability to hot reload.

# Help needed
I'm looking for help getting hot reload to work in this setup using the serverless-offline plugin. I tried to strip down down the entire infrastructure of my app, and then added in portions of the stack bit by bit until I was able to reproduce a minimum viable example of the hot reload issue.

## Setup / Reproducing the issue

First, run `npm install`.

Then, start the dev instance with `sls offline start --reloadHandler`

You should see a message like this:

```
Offline [http for lambda] listening on http://localhost:3002
Function names exposed for local invocation by aws-sdk:
           * ping: serverless-offline-issue-dev-ping

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ANY | http://localhost:3000/dev/v0/ping                           │
│   POST |                                                            │
│   http://localhost:3000/2015-03-31/functions/ping/invocations       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Server ready: http://localhost:3000
```

Now, you can invoke the lambda via cURL request in a second terminal like this:

```
curl --location 'http://localhost:3000/dev/v0/ping' \
--header 'Content-Type: application/json' \
--data '{
    "test_message": "test_response"
}'
```

You should see a 200 response that includes 
```
  "message": "ping successful",
```

In your first terminal, in the console, you should see a log that says `RUN - 1`.

Now, to reproduce the hot reload issue, navigate to `src/ping/ping.ts` and modify the console.log statement to log `RUN - 2`. Invoke the same cURL command as before. You will notice that the console.log still says `RUN - 1`. 

Wait for a few minutes (for my computer it takes about 60 seconds) and run the cURL command again. This time you should see the log `RUN -2`.

This indicates two issues:
1. Hot reload does work, but it is extremely slow. I think that since my actual codebase has more and larger lambdas, it is much slower than this minimum example.
2. There is no CLI feedback that indicates when the hot reload is complete. Thus, we can't know when it's safe to proceed with local development. 


# Webpack/Babel
I'm far from an expert in either of these technologies, though I understand their general principles. In this project, the .babelrc file is intended to handle transpiling typescrypt, and webpack.config.js is intended to handle bundling of my lambdas for efficient deployment to AWS. 

The serverless-webpack plugin hooks into the serverless deployment lifecycle and bundles each lambda defined in the `functions` section of the serverless.yml file; the bundled code is what runs when the lambda functions are invoked.

# Serverless
Serverless file defines:
- provider information for deployment to aws. iam permissions are * for all aws services being used to simplify things.
- package instructions for serverless deployment
- plugins - reduced to minimum plugins needed to produce the issue