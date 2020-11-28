// SELECT * FROM cngei.incarichi;
const iscrizioni = require('../incarichi.json').incarichi
const ruoli = require('../ruoli.json').ruoli
const fs = require('fs')

const importIncarichi = async (kcAdminClient) => {
    console.log("Starting import for roles")
    const currentRoles = await kcAdminClient.roles.find({ realm: 'cngei' });
    for (role of currentRoles) {
        await kcAdminClient.roles.delById({ id: role.id, realm: 'cngei' })
    }

    await Promise.all(
        ruoli.map(role =>
            kcAdminClient.roles.create({ realm: 'cngei', name: role.sigla, description: role.ruolo }))
    )
    const newRoles = await kcAdminClient.roles.find({ realm: 'cngei' });

    const currentIncarichi = iscrizioni.filter(x => x.annoscout == '201920' &&
        x.terminato === 0 &&
        !['E', 'L', 'R'].includes(x.incarico))

    let errors = []

    console.log("Starting import for incarichi")
    for (let incarico of currentIncarichi) {
        try {
            console.log(`Creating incarico ${incarico.incarico} for ${incarico.tessera}`)
            const tempRole = newRoles.find(role => incarico.incarico === role.name)
            const utente = (await kcAdminClient.users.findOne({ username: incarico.tessera.toString(), realm: 'cngei' }))
                .find(x => x.username == incarico.tessera)
            await kcAdminClient.users.addRealmRoleMappings({
                id: utente.id,
                roles: [{
                    id: tempRole.id,
                    name: tempRole.name,
                }],
                realm: 'cngei'
            })
            console.log(`Created incarico ${incarico.incarico} for ${incarico.tessera}`)
        } catch (e) {
            errors.push({tessera: incarico.tessera, error: e})
        }
    }
    fs.writeFileSync('ruoli-errors.json', JSON.stringify(errors, null, 2))
}

module.exports = importIncarichi