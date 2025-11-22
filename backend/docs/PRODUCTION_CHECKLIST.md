# Production Deployment Checklist
## SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`pytest tests/ -v`)
- [ ] Code coverage > 70%
- [ ] No linting errors
- [ ] Type hints present
- [ ] Docstrings complete

### Security
- [ ] ADMIN_TOKEN set in .env
- [ ] CORS origins configured
- [ ] No hardcoded secrets
- [ ] Input validation enabled
- [ ] Rate limiting configured

### Performance
- [ ] Solver timeout set (20s default)
- [ ] Request size limits enforced
- [ ] Database connections pooled
- [ ] Caching enabled where applicable
- [ ] Logging level set to INFO

### Monitoring
- [ ] Health checks working
- [ ] Metrics endpoint accessible
- [ ] Logs being written
- [ ] Error tracking enabled
- [ ] Alerts configured

### Documentation
- [ ] API docs generated
- [ ] Example payloads provided
- [ ] README updated
- [ ] Deployment guide created
- [ ] Troubleshooting guide written

---

## 🚀 Deployment Steps

### 1. Environment Setup
```bash
# Create .env file
cp .env.example .env

# Set production values
export DEBUG=False
export LOG_LEVEL=INFO
export ADMIN_TOKEN=your-secure-token
export OPTIMIZER_TIME_LIMIT=20
```

### 2. Build Docker Image
```bash
docker build -t sail-bokaro-api:1.0.0 .
```

### 3. Run with Docker Compose
```bash
docker-compose up -d
```

### 4. Verify Deployment
```bash
# Check health
curl http://localhost:8000/meta/health

# Check metrics
curl http://localhost:8000/meta/metrics

# Test optimization
curl -X POST http://localhost:8000/optimize/dispatch \
  -H "Content-Type: application/json" \
  -d @docs/api_examples/optimize_sample.json
```

### 5. Monitor Logs
```bash
docker-compose logs -f api
```

---

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Health check latency | < 100ms | - |
| Forecast latency | < 500ms | - |
| Optimization latency | < 20s | - |
| Optimizer success rate | > 95% | - |
| API uptime | > 99.9% | - |
| Error rate | < 0.1% | - |

---

## 🔍 Health Checks

### Endpoint Health
```bash
curl http://localhost:8000/meta/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": 7,
  "models_failed": 0
}
```

### Model Status
```bash
curl http://localhost:8000/meta/models
```

All models should show `"status": "loaded"`

### Metrics
```bash
curl http://localhost:8000/meta/metrics
```

Check:
- Uptime > 0
- Request counts reasonable
- Optimizer success rate > 95%

---

## 🚨 Troubleshooting

### Models Not Loading
```bash
# Check logs
docker-compose logs api | grep "Failed to load"

# Reload models
curl -X POST http://localhost:8000/meta/reload-models \
  -H "X-API-Token: your-admin-token"
```

### High Latency
```bash
# Check metrics
curl http://localhost:8000/meta/metrics | jq '.data.requests'

# Check solver time
# Increase OPTIMIZER_TIME_LIMIT if needed
```

### Memory Issues
```bash
# Check Docker stats
docker stats sail-bokaro-api

# Reduce worker count if needed
```

---

## 📈 Scaling

### Horizontal Scaling
```bash
# Use load balancer (nginx, HAProxy)
# Run multiple API instances
# Use shared model cache
```

### Vertical Scaling
```bash
# Increase worker count in docker-compose
# Increase memory allocation
# Increase solver time limit
```

---

## 🔐 Security Hardening

### API Security
- [ ] Enable HTTPS/TLS
- [ ] Set secure CORS origins
- [ ] Implement rate limiting
- [ ] Add request signing
- [ ] Enable CSRF protection

### Infrastructure Security
- [ ] Use private networks
- [ ] Enable firewall rules
- [ ] Rotate credentials regularly
- [ ] Monitor access logs
- [ ] Set up intrusion detection

---

## 📝 Maintenance

### Daily
- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Monitor metrics

### Weekly
- [ ] Review performance metrics
- [ ] Check disk usage
- [ ] Verify backups

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Performance tuning
- [ ] Model drift analysis

---

## 🔄 Rollback Procedure

If deployment fails:
```bash
# Stop current deployment
docker-compose down

# Restore previous version
docker pull sail-bokaro-api:previous-version
docker-compose up -d

# Verify health
curl http://localhost:8000/meta/health
```

---

## 📞 Support Contacts

- **API Issues**: Check `/meta/health` and logs
- **Model Issues**: Reload with `/meta/reload-models`
- **Performance Issues**: Check `/meta/metrics`
- **Emergency**: Kill process and restart

---

**Deployment Ready!**

