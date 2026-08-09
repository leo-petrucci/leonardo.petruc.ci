# leonardo.petruc.ci

Personal site, deployed to AWS with SST.

## Web 1.0 Hit Counter

`HitCounterFunction` returns an odometer-style SVG and increments one shared
counter when a browser loads it as an image. It deliberately counts hits, not
visitors: it stores no IP addresses, cookies, fingerprints, or other visitor
identifiers. The value is decorative and is not an accuracy metric.

The SST configuration creates the on-demand DynamoDB table `hits` with `pk` as
its string partition key. The Lambda has only `dynamodb:GetItem` and
`dynamodb:UpdateItem` permissions for that table. Its Function URL is public,
has CORS disabled, and has no VPC or API Gateway in front of it.

### Setup And Embed

1. Set `ALLOWED_HOST` to a substring of the published page's host. Use the
   `.webflow.io` host while staging, then update it to the production host and
   redeploy. Optionally set `FALLBACK_COUNT` and `PAD_WIDTH`; they default to
   `0` and `6`.
2. Deploy with the environment values available to SST:

   ```bash
   ALLOWED_HOST=example.webflow.io bunx sst deploy --stage prod
   ```

3. Copy the `HitCounterFunction` URL from the SST deploy output and add it to a
   published page with meaningful alternate text:

   ```html
   <img src="https://your-function.lambda-url.eu-west-1.on.aws/" alt="Visitor count">
   ```

Opening the Function URL directly and requests from `curl` both take the
non-incrementing read path. A real image request needs a valid `Referer`; this
is intentional. The endpoint always returns a valid SVG with HTTP 200, even
when DynamoDB is unavailable. It sends `cache-control: no-store` so a reload
creates another hit.

### Privacy And Operations

- Do not enable Function URL access logging if the no-personal-data claim is
  important: CloudWatch access logs can capture source IP addresses even though
  the application does not store them. Otherwise use a short retention period.
- The Lambda cache is per warm execution environment. Bot and rejected requests
  may see a slightly stale number without a DynamoDB read; this is intentional.
- There are no dashboards, time series, per-page counters, or unique-visitor
  tracking. Adding any of those, or identifiers used for deduplication, changes
  the privacy model and should be explicitly reviewed.

Run the handler checks with:

```bash
bun run test:hit-counter
```

## Webflow Word Count

`WebflowWordCountFunction` returns the total words in all published items in a
single Webflow CMS collection. It reads Webflow server-side, caches the total
inside the Lambda instance for one hour, and exposes only the total and the
number of published articles to the browser.

### Setup

1. Create a Webflow **site token** in Webflow Dashboard -> site -> Settings ->
   API access -> Generate API token. Give it the `CMS:read` scope. A site token
   is correct for this one-site, read-only integration; do not create OAuth or
   use a workspace token.
2. Discover the collection and Rich Text body-field slug. The token stays in
   your shell and is never included in the browser snippet.

   ```bash
   WEBFLOW_API_TOKEN=your-token bun run webflow:discover
   ```

   The command prints every site, collection ID, and field type/slug. Rich Text
   fields are flagged to make the article body easy to identify.
3. Check each article before deployment. This uses the published-items API and
   paginates in batches of 100.

   ```bash
   WEBFLOW_API_TOKEN=your-token \
   COLLECTION_ID=your-collection-id \
   BODY_FIELD=your-rich-text-field-slug \
   bun run webflow:verify
   ```

4. Set these values in the deployment environment or GitHub Actions secrets:
   `WEBFLOW_API_TOKEN`, `COLLECTION_ID`, `BODY_FIELD`, and `ALLOWED_ORIGIN`.
   `ALLOWED_ORIGIN` must include the scheme, for example
   `https://example.webflow.io` while testing or `https://www.example.com` in
   production.

### Test And Deploy

Run the fixed word-count cases:

```bash
bun run test:webflow
```

SST uses the AWS CLI credentials in the current shell to deploy the Lambda and
Function URL to `eu-west-1`:

```bash
aws sts get-caller-identity
WEBFLOW_API_TOKEN=your-token \
COLLECTION_ID=your-collection-id \
BODY_FIELD=your-rich-text-field-slug \
ALLOWED_ORIGIN=https://example.webflow.io \
bunx sst deploy --stage prod
```

The deploy output includes the `WebflowWordCountFunction` URL. You can also
retrieve a deployed Function URL with the AWS CLI:

```bash
aws lambda get-function-url-config \
  --function-name your-deployed-function-name \
  --region eu-west-1 \
  --query FunctionUrl \
  --output text
```

 The GitHub Actions workflow reads the same four Webflow values from repository
 secrets. It also reads `ALLOWED_HOST`, `FALLBACK_COUNT`, and `PAD_WIDTH` for
 the hit counter.

### Webflow Embed

Place an element such as this wherever the metric belongs:

```html
<span data-wordcount="total">500,341</span>
```

Paste the contents of `webflow-word-count-embed.js` into a Webflow Code Embed,
replacing `PASTE_YOUR_LAMBDA_FUNCTION_URL_HERE` with the deployed Function URL.
It formats with `toLocaleString()`, counts up for about 1.2 seconds, honors
reduced-motion preferences, and leaves the placeholder unchanged if the request
fails.

### Operational Notes

- The endpoint uses Webflow's `listItemsLive` API, so drafts are excluded. Rich
  text is counted as HTML with simple tag/entity stripping by design.
- The cache is Lambda module scope and lasts one hour. A cold start recomputes
  the number. If a later Webflow request fails, the handler returns the prior
  cached value with `stale: true`; it returns 502 only before its first
  successful calculation.
- CORS is configured twice: the Function URL restricts browser origins and the
  handler sets `access-control-allow-origin`. During Webflow testing set
  `ALLOWED_ORIGIN` to the `.webflow.io` staging URL and deploy with it; switch
  it to the production origin and redeploy before launch.
- The Function URL has `authorization: "none"`, equivalent to AWS CLI
  `--auth-type NONE`, because a browser must call this public vanity endpoint.
  It only returns a cached aggregate. Do not copy this setting to endpoints
  that return real or sensitive data.
- For this POC the token is a plaintext Lambda environment variable and is
  visible to people with Lambda console access. Move it to AWS Secrets Manager
  when stronger secret-access controls are needed.
- If cold-start recomputation becomes a problem, use an EventBridge-scheduled
  writer Lambda that persists the derived total in DynamoDB plus a thin Function
  URL reader. Optionally invoke the writer from Webflow
  `collection_item_changed`, `collection_item_created`, and
  `collection_item_deleted` webhooks. The writer should still recompute from
  CMS data so the value cannot drift.
