// SELECT * FROM edp.fe_users;
const oldUsers = require('../dump.json').fe_users
const fs = require('fs')

const importUsers = async (kcAdminClient) => {
    console.log("Starting import for users")
    // Delete existing users, just in case
    const users = (await kcAdminClient.users.find({ max: 9999, realm: 'cngei' })).filter(x => x.username !== 'admin')
    for (let user of users) {
        await kcAdminClient.users.del({ id: user.id, realm: 'cngei' })
    }

    let errors = []

    // Recreate each user
    for (let user of oldUsers) {
        try {
            console.log("Creating user ", user.username)
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
            console.log("Created user ", user.username)
        } catch (e) {
            errors.push({tessera: user.username, error: e.response.data})
        }
    }
    fs.writeFileSync('user-errors.json', JSON.stringify(errors, null, 2))
}

module.exports = importUsers