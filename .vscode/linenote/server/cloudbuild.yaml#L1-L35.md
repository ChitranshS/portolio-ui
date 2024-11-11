To redeploy the updated `cloudbuild.yaml`, use the same command:

```bash
# From your project directory
gcloud builds submit --config cloudbuild.yaml
```

Step by step verification:

1. **Submit the build**:
```bash
gcloud builds submit --config cloudbuild.yaml
```

2. **Check build status**:
```bash
# Watch the build progress
gcloud builds list

# Or get detailed logs of the latest build
gcloud builds log $(gcloud builds list --format='get(id)' --limit=1)
```

3. **Verify deployment**:
```bash
# Check if service is running
gcloud run services describe resume-api --region=asia-south1

# Get the service URL
gcloud run services describe resume-api --region=asia-south1 --format='value(status.url)'
```

If you need to troubleshoot:
```bash
# Check service logs
gcloud beta run services logs tail resume-api --region=asia-south1

# Check environment variables
gcloud run services describe resume-api \
  --region=asia-south1 \
  --format='table(spec.template.spec.containers[0].env[])'
```

Common issues:
1. If build fails: Check logs for error messages
2. If service isn't updating: Verify the yaml was saved
3. If environment variables aren't set: Check the --set-env-vars section

Would you like me to explain:
1. How to rollback if something goes wrong?
2. How to check service health?
3. How to monitor deployment status?