const KeycloakAdminClient = require('keycloak-admin').default;

const scripts = [
    require('./scripts/authenticate'),
    require('./scripts/initializeRealm'),
    require('./scripts/importUsers'),
    require('./scripts/importSezioni'),
    require('./scripts/importIscrizioni'),
    require('./scripts/importRoles'),
]

const KC_HOST = 'http://localhost:9000'

const kcAdminClient = new KeycloakAdminClient({
    baseUrl: `${KC_HOST}/auth`,
});

(async () => {
    for(script of scripts) {
        await script(kcAdminClient)
    }
})()
