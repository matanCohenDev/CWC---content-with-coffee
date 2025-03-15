module.exports = {
  apps : [{
    name: "REST SERVER",
    script: "npm",
    args: "run server_prod",
    cwd: "/home/st111/CWC---content-with-coffee",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
