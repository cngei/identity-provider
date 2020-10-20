const KeycloakAdminClient = require('keycloak-admin').default;

// SELECT * FROM edp.fe_users;
const oldUsers = require('./dump.json').fe_users

const KC_HOST = 'http://localhost:8080'
const KC_USER = 'admin'
const KC_PASSWORD = 'admin'

const kcAdminClient = new KeycloakAdminClient({
    baseUrl: `${KC_HOST}/auth`,
});

const importUsers = async () => {
    await kcAdminClient.auth({
        username: KC_USER,
        password: KC_PASSWORD,
        grantType: 'password',
        clientId: 'admin-cli'
    });

    // Delete existing users, just in case
    const users = (await kcAdminClient.users.find({ max: 9999, realm: 'cngei' })).filter(x => x.username !== 'admin')
    for (let user of users) {
        await kcAdminClient.users.del({ id: user.id, realm: 'cngei' })
    }

    // Recreate each user
    for (let user of oldUsers) {
        try {
            await kcAdminClient.users.create({
                realm: 'cngei',
                credentials: [
                    {
                        algorithm: 'md5crypt',
                        hashedSaltedValue: user.password,
                        // Useless parameter, but must be set
                        hashIterations: 1,
                        type: 'password',
                        salt: ''
                    }
                ],
                username: user.username,
                email: user.email,
                enabled: true,
                emailVerified: true
            })
        } catch (e) {
            // There are users with the same email, what do we do?
            console.log(user.email, user.username)
            // console.log(e)
        }
    }
}

importUsers()