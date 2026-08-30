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
        aliases: ['petruc.ci', 'www.petruc.ci'],
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
