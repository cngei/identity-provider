const realmData = require('../realm-export.json')

const initializeRealm = async (kcAdminClient) => {
    try {
        await kcAdminClient.realms.create(realmData)
        console.log("Realm CNGEI created")
    } catch (e) {
        console.log(e)
    }
}

module.exports = initializeRealm