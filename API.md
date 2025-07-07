# API Documentation - Bot Discord Professionnel

## Endpoints de monitoring

### GET /health
Endpoint principal de health check pour Railway et autres systèmes de monitoring.

**Réponse 200 (Bot sain):**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2025-01-07T01:30:00.000Z",
  "service": "bot-discord-professionnel",
  "version": "1.0.0",
  "checks": {
    "discord": true,
    "memory": true,
    "uptime": true
  }
}
```

**Réponse 503 (Bot non sain):**
```json
{
  "status": "unhealthy",
  "uptime": 60,
  "timestamp": "2025-01-07T01:30:00.000Z",
  "service": "bot-discord-professionnel",
  "version": "1.0.0",
  "checks": {
    "discord": false,
    "memory": true,
    "uptime": true
  }
}
```

### GET /metrics
Endpoint de métriques au format Prometheus pour monitoring avancé.

**Réponse 200:**
```
# HELP bot_discord_uptime_seconds Uptime du bot Discord en secondes
# TYPE bot_discord_uptime_seconds counter
bot_discord_uptime_seconds 3600

# HELP bot_discord_commands_total Nombre total de commandes exécutées
# TYPE bot_discord_commands_total counter
bot_discord_commands_total 42

# HELP bot_discord_errors_total Nombre total d'erreurs
# TYPE bot_discord_errors_total counter
bot_discord_errors_total 0

# HELP bot_discord_guilds_count Nombre de serveurs connectés
# TYPE bot_discord_guilds_count gauge
bot_discord_guilds_count 1

# HELP bot_discord_ping_ms Ping Discord en millisecondes
# TYPE bot_discord_ping_ms gauge
bot_discord_ping_ms 100

# HELP process_heap_bytes Mémoire heap utilisée en bytes
# TYPE process_heap_bytes gauge
process_heap_bytes 52428800

# HELP process_rss_bytes RSS mémoire en bytes
# TYPE process_rss_bytes gauge
process_rss_bytes 104857600
```

### GET /ready
Endpoint de readiness pour vérifier si le bot est prêt à recevoir du trafic.

**Réponse 200 (Prêt):**
```json
{
  "ready": true
}
```

**Réponse 503 (Pas prêt):**
```json
{
  "ready": false
}
```

## Utilisation avec Railway

Railway utilise automatiquement l'endpoint `/health` configuré dans `railway.json`:
- Intervalle de check: 30 secondes
- Timeout: 300 secondes
- Le bot est considéré comme sain si l'endpoint retourne 200

## Intégration Prometheus/Grafana

Pour monitorer le bot avec Prometheus:

1. Ajouter le job dans `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'discord-bot'
    static_configs:
      - targets: ['bot-url.railway.app']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

2. Créer des dashboards Grafana avec les métriques disponibles

## Codes de réponse

- **200 OK**: Service opérationnel
- **503 Service Unavailable**: Service non disponible ou non sain
- **404 Not Found**: Endpoint inexistant
