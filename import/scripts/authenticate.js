const KC_USER = 'admin'
const KC_PASSWORD = 'admin'

const authenticate = (kcAdminClient) => {
    return kcAdminClient.auth({
        username: KC_USER,
        password: KC_PASSWORD,
        grantType: 'password',
        clientId: 'admin-cli'
    })
}

module.exports = authenticate