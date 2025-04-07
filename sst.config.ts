/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'leonardo-petruc-ci',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
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

    new sst.aws.TanstackStart('Site', {
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
