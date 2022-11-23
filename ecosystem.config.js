module.exports = {
    apps: [
        {
            name: "web-auth-server",
            script: "./bin/www",
            watch: true,
            env: {
                "PORT": 3003,
                "NODE_ENV": "development"
            },
            env_production: {
                "PORT": 90,
                "NODE_ENV": "production",
            }
        }
    ]
}