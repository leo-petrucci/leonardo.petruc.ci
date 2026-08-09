/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'leonardo-petruc-ci',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: "eu-west-1",
        }
      }
    };
  },
  async run() {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    const hitCounter = new sst.aws.Dynamo('HitCounter', {
      fields: {
        pk: 'string',
      },
      primaryIndex: { hashKey: 'pk' },
      transform: {
        table: {
          name: 'hits',
          billingMode: 'PAY_PER_REQUEST',
        },
      },
    });

    const githubFunction = new sst.aws.Function('GitHubFunction', {
      handler: 'src/functions/github.handler',
      url: true,
      environment: {
        GH_TOKEN: process.env.GH_TOKEN || '',
      },
    });

    new sst.aws.Function('WebflowWordCountFunction', {
      handler: 'src/functions/webflow-word-count.handler',
      runtime: 'nodejs20.x',
      timeout: '15 seconds',
      memory: '256 MB',
      url: {
        authorization: 'none',
        cors: allowedOrigin
          ? {
              allowMethods: ['GET'],
              allowOrigins: [allowedOrigin],
            }
          : false,
      },
      environment: {
        WEBFLOW_API_TOKEN: process.env.WEBFLOW_API_TOKEN || '',
        COLLECTION_ID: process.env.COLLECTION_ID || '',
        BODY_FIELD: process.env.BODY_FIELD || '',
        ALLOWED_ORIGIN: allowedOrigin || '',
      },
    });

    new sst.aws.Function('HitCounterFunction', {
      handler: 'src/functions/hit-counter.handler',
      runtime: 'nodejs20.x',
      timeout: '5 seconds',
      memory: '128 MB',
      copyFiles: [
        {
          from: 'Perfect DOS VGA 437-subset.ttf',
          to: 'Perfect DOS VGA 437-subset.ttf',
        },
      ],
      url: {
        authorization: 'none',
        cors: false,
      },
      permissions: [
        {
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          resources: [hitCounter.arn],
        },
      ],
      environment: {
        TABLE_NAME: hitCounter.name,
        ALLOWED_HOST: process.env.ALLOWED_HOST || '',
        FALLBACK_COUNT: process.env.FALLBACK_COUNT || '0',
        PAD_WIDTH: process.env.PAD_WIDTH || '6',
      },
    });

    new sst.aws.TanStackStart('Site', {
      domain: {
        name: 'leonardo.petruc.ci',
        redirects: ['www.leonardo.petruc.ci'],
      },
      dev: {
        command: 'bun dev',
      },
      environment: {
        VITE_GITHUB_FUNCTION_URL: githubFunction.url,
      }
    });
  },
});
