module.exports = {
    dbUsername: process.env.DB_USER_NAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: 'agentdesk',
    dbPort: process.env.DB_PORT || 5432,
    dbHost: process.env.DB_HOST
}