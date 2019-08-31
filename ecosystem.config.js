module.exports = {
  apps: [
    {
      name: 'ip-spider',
      script: './dist/src/main.js',
      instances: 1,

      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm',
      merge_logs: true,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production'
      },
      max_memory_restart: '1G',
      output: './logs/pm2-out.log',
      error: './logs/pm2-error.log'
    }
  ]
}
