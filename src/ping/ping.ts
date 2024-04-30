'use strict'
import 'dotenv/config'
// Require and init API router module
import createApi, { NextFunction, Request, Response } from 'lambda-api';
import { APIGatewayProxyEvent, Context, Callback } from 'aws-lambda';
const app = createApi({ version: 'v0.0', base: 'v0' });

//----------------------------------------------------------------------------//
// Define Middleware
//----------------------------------------------------------------------------//

  // Add CORS Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });

  // Add Authorization Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });

//----------------------------------------------------------------------------//
// Build API routes
//----------------------------------------------------------------------------//

  app.post('/ping', (req: Request,res: Response) => {
    // Send the response

    console.log('RUN - 1')

    res.status(200).json({
      status: 'ok',
      message: 'ping successful',
      version: req.version,
      auth: req.auth,
      body: req.body,
      query: req.query
    })
  })


  app.options('/*', (req: Request,res: Response) => {
    res.status(200).json({})
  })
  
  //----------------------------------------------------------------------------//
  // Main router handler
  //----------------------------------------------------------------------------//
  export const router = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    // Set this flag to false, otherwise, the lambda function won't quit until all DB connections are closed
    context.callbackWaitsForEmptyEventLoop = false;
  
    // Run the request
    app.run(event, context, callback);
  };
