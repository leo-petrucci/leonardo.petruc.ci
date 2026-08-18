# Disposable libSQL Sandbox

This is a separate SST app. It does not share resources with the public site.

## Deploy

```bash
bun install
bunx sst deploy --stage sandbox
```

The stack creates one ARM `t4g.small` EC2 instance. Docker runs a pinned ARM64 libSQL image. The encrypted root EBS volume stores libSQL data at `/var/lib/libsql` and is deleted with the instance.

The security group has no inbound rules. Use the `portForward` output to connect locally through AWS Systems Manager:

```bash
aws ssm start-session --target <instance-id> --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["8080"],"localPortNumber":["8080"]}'
```

Then use `http://localhost:8080` as the libSQL URL.

## Remove

```bash
bunx sst remove --stage sandbox
```

Removal deletes the complete sandbox, including the instance and its database. Do not store real CMS content here.
