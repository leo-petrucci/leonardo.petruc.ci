/// <reference path="../../.sst/platform/config.d.ts" />

const libsqlImage =
  'ghcr.io/tursodatabase/libsql-server@sha256:fa1a5f9a6ae638be9b36fdfd53afafc78fa734b209d2dfc3ae772a53063f405c'

export default $config({
  app(input) {
    if (input?.stage !== 'sandbox') {
      throw new Error('This disposable stack can only run with --stage sandbox.')
    }

    return {
      name: 'leonardo-petruc-libsql',
      removal: 'remove',
      home: 'aws',
      providers: {
        aws: {
          region: 'eu-west-1',
        },
      },
    }
  },
  async run() {
    const vpc = new sst.aws.Vpc('Vpc', { az: 1 })
    const subnetID = vpc.publicSubnets.apply((subnets) => subnets[0])
    const subnet = aws.ec2.getSubnetOutput({ id: subnetID })
    const ami = aws.ec2.getAmiOutput({
      filters: [
        {
          name: 'name',
          values: ['al2023-ami-2023.*-kernel-6.1-arm64'],
        },
        {
          name: 'architecture',
          values: ['arm64'],
        },
      ],
      mostRecent: true,
      owners: ['amazon'],
    })

    const role = new aws.iam.Role('InstanceRole', {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: 'ec2.amazonaws.com',
      }),
    })
    new aws.iam.RolePolicyAttachment('SsmAccess', {
      role: role.name,
      policyArn: 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore',
    })
    const instanceProfile = new aws.iam.InstanceProfile('InstanceProfile', {
      role: role.name,
    })

    const securityGroup = new aws.ec2.SecurityGroup('SecurityGroup', {
      description: 'Allows outbound traffic for Docker and SSM. No inbound access.',
      egress: [
        {
          cidrBlocks: ['0.0.0.0/0'],
          fromPort: 0,
          protocol: '-1',
          toPort: 0,
        },
      ],
      vpcId: vpc.id,
    })

    const instance = new aws.ec2.Instance('Instance', {
      ami: ami.id,
      associatePublicIpAddress: true,
      instanceType: 't4g.small',
      iamInstanceProfile: instanceProfile.name,
      rootBlockDevice: {
        deleteOnTermination: true,
        encrypted: true,
        volumeSize: 20,
        volumeType: 'gp3',
      },
      subnetId: subnetID,
      tags: {
        Name: 'leonardo-petruc-libsql-sandbox',
      },
      userData: `#!/bin/bash
set -euo pipefail

dnf install -y docker
systemctl enable --now docker
mkdir -p /var/lib/libsql

docker run --detach \\
  --name libsql \\
  --restart unless-stopped \\
  --publish 127.0.0.1:8080:8080 \\
  --volume /var/lib/libsql:/var/lib/sqld \\
  --env SQLD_NODE=primary \\
  ${libsqlImage}
`,
      vpcSecurityGroupIds: [securityGroup.id],
    })

    return {
      instanceID: instance.id,
      instanceSubnet: subnet.cidrBlock,
      portForward: $interpolate`aws ssm start-session --target ${instance.id} --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["8080"],"localPortNumber":["8080"]}'`,
    }
  },
})
