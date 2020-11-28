// SELECT * FROM cngei.sezioni;
const sezioni = require('../sezioni.json').sezioni
const fs = require('fs')

const importSezioni = async (kcAdminClient) => {
    const groups = (await kcAdminClient.groups.find({ max: 9999, realm: 'cngei' }))
    for (let group of groups) {
        await kcAdminClient.groups.del({ id: group.id, realm: 'cngei' })
    }

    let errors = []
    console.log('Starting import for sezioni')
    for (let sezione of sezioni.filter(x => x.chiusa === 0)) {
        try {
            console.log("Creating sezione ", sezione.sezione)
            await kcAdminClient.groups.create({
                name: sezione.sezione,
                realm: 'cngei',
                // For some reasons, Keycloak states that attributes are a Record<string, any>
                // But actually it should be Record<string, any[]>
  //              attributes: Object.fromEntries(
  //                  Object.entries(sezione).map(([k,v]) => ([k,[v]]))
  //              )
            })
            console.log("Created sezione ", sezione.sezione)
        } catch (e) {
            errors.push(sezione.sezione)
        }
        fs.writeFileSync('sezioni-errors.json', JSON.stringify(errors, null, 2))
    }
}

module.exports = importSezioni
