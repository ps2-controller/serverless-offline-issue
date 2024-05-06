# Overview
This repo tries to simplify my stack to its bare bones - to try to isolate why my hot reload is no longer working. 

I started using serverless-webpack to bundle my code for deployment because my lambdas had become too big to deploy. Something about my webpack and serverless setup has removed my ability to hot reload.

# Help needed
I'm looking for help getting hot reload to work in this setup using the serverless-offline plugin. I tried to strip down down the entire infrastructure of my app, and then added in portions of the stack bit by bit until I was able to reproduce a minimum viable example of the hot reload issue.

## Setup / Reproducing the issue

### General setup

First, run `npm install`.

### Without serverless-webpack - fast hot reload (baseline / happy path)

Make the following changes to the repo
1. in serverless.yml, comment out code as follows 
- Make sure that your `plugins` section looks like this
```
  plugins:
    # - serverless-webpack # comment out to use without webpack
    - serverless-offline
```
- Make sure that your `handler` section looks like this
```
  # handler: src/ping/ping.router # comment out to use without webpack
  handler: dist/src/ping/ping.router # comment out to use with webpack
```

Additionally, ensure that your package.json includes

```
  "type": "module",
```

2. Start the dev instance with `sls offline start --reloadHandler`

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

3. In a second terminal run tsc watch -- this will listen for file changes and update the dist folder.

4. Invoke the lambda via cURL request in a third terminal like this:

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

5. To successfully hot reload, navigate to `src/ping/ping.ts` and modify the console.log statement to log `RUN - 2`. Save the file. You'll observe the tsc-watch terminal immediately letting you know that the file in the dist directory has re-compiled. Invoke the same cURL command as before. You will notice that the console.log now says `RUN - 2`. Our hot reload was quick and successful. 

### With serverless-webpack - slow hot reload (issue / unhappy path)

Our steps to run the code with the issue are very similar:

1. Make the following changes to the repo
In serverless.yml, comment out code as follows 
- Make sure that your `plugins` section looks like this
```
  plugins:
    # - serverless-webpack # comment out to use without webpack
    - serverless-offline
```
- Make sure that your `handler` section looks like this
```
  # handler: src/ping/ping.router # comment out to use without webpack
  handler: dist/src/ping/ping.router # comment out to use with webpack
```

If your package.json includes
```
  "type": "module",
```
remove it.

2. Start the dev instance with `sls offline start --reloadHandler`

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
```
Callout!
Unlike the previous case, we do not need to run tsc watch. Serverless-webpack allows our handlers to point directly to the source files and automatically takes care of pointing the serverless-offline handler to the built files in the .webpack directory
```

3. Invoke the lambda via cURL request in a second terminal like this:

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

4. To recreate the issue with hot reload, navigate to `src/ping/ping.ts` and modify the console.log statement to log `RUN - 2`. Save the file. Invoke the same cURL command as before. You will notice that the console output continues to output `RUN - 1`. Our hot reload was not successful; there is no additional feedback in the CLI to indicate that the hot reload is in-process.

Wait for a few minutes (for my computer it takes about 60 seconds) and run the cURL command again. This time you should see the log `RUN -2`.

This indicates two issues when using serverless-webpack in conjunction with serverless-offline:
1. Hot reload does work, but it is extremely slow. I think that since my actual codebase has more and larger lambdas, it is much slower than this minimum example.
2. There is no CLI feedback that indicates when the hot reload is complete. Thus, we can't know when it's safe to proceed with local development. 


# General info about the repo
## Webpack/Babel
I'm far from an expert in either of these technologies, though I understand their general principles. In this project, the .babelrc file is intended to handle transpiling typescrypt, and webpack.config.js is intended to handle bundling of my lambdas for efficient deployment to AWS. 

The serverless-webpack plugin hooks into the serverless deployment lifecycle and bundles each lambda defined in the `functions` section of the serverless.yml file; the bundled code is what runs when the lambda functions are invoked.

## Serverless
Serverless file defines:
- provider information for deployment to aws. iam permissions are * for all aws services being used to simplify things.
- package instructions for serverless deployment
- plugins - reduced to minimum plugins needed to produce the issue