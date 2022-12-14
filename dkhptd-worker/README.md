# How to run

```bash
docker run -v "$(pwd)/config.json:/app/config.json" -v "$(pwd)/jobs:/app/jobs/" --network rabbitmq_customnetwork tuana9a/dkhptd-worker
```