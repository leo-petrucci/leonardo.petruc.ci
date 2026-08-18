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
    if ($dev) {
      new sst.aws.Nextjs('CMS', {
        path: 'cms',
        dev: {
          command: 'bun run dev -- --port 3001',
          directory: 'cms',
          url: 'http://localhost:3001',
        },
      });
    }

    const githubFunction = new sst.aws.Function('GitHubFunction', {
      handler: 'src/functions/github.handler',
      url: true,
      environment: {
        GH_TOKEN: process.env.GH_TOKEN || '',
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
        VITE_PAYLOAD_URL:
          $dev ? 'http://localhost:3001' : process.env.VITE_PAYLOAD_URL || '',
      }
    });
  },
});
