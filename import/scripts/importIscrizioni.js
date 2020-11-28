// SELECT * FROM cngei.iscrizioni;
const iscrizioni = require('../iscrizioni.json').iscrizioni
const fs = require('fs')

const byName = arr => new Map(arr.map(item => ([item.name, item])))

const importIscrizioni = async (kcAdminClient) => {
    console.log("Starting import for iscrizioni")
    const currentIscrizioni = iscrizioni.filter(x => x.annoscout == '201920'
        && x.confermato == 1
        && x.tipo == 'A'
    )

    const subGroups = new Map()

    currentIscrizioni.forEach(({ sezione, gruppo }) => {
        if (!subGroups.has(sezione)) {
            subGroups.set(sezione, new Set())
        }
        subGroups.get(sezione).add(gruppo)
    })

    console.log('Starting import for gruppi')
    const groups = await kcAdminClient.groups.find({ max: 9999, realm: 'cngei' })
    for(group of groups) {
        if(subGroups.has(group.name)) {
            console.log('Creating subgroups for ', group.name)
            for(subGroup of subGroups.get(group.name)) {
                try {
                   await kcAdminClient.groups.setOrCreateChild({id: group.id, realm: 'cngei'}, {name: subGroup})
                } catch(e) {
                    console.log(e.response.data)
                }
            }
        }
    }

    const newGroups = await kcAdminClient.groups.find({max: 9999, realm: 'cngei'})
    const groupsMap = byName(newGroups.map(x => ({...x, subGroups: byName(x.subGroups)})))

    let errors = []

    for (let iscrizione of currentIscrizioni) {
        try {
            console.log("Creating iscrizione ", iscrizione.tessera)
            const sezione = groupsMap.get(iscrizione.sezione)
            const tempGroup = sezione.subGroups.get(iscrizione.gruppo.toString())
            const utente = (await kcAdminClient.users.findOne({username: iscrizione.tessera.toString(), realm: 'cngei'}))
                .find(x => x.username == iscrizione.tessera)
            await kcAdminClient.users.addToGroup({id: utente.id, groupId: sezione.id, realm: 'cngei'})
            await kcAdminClient.users.addToGroup({id: utente.id, groupId: tempGroup.id, realm: 'cngei'})
            console.log("Created iscrizione ", iscrizione.tessera)
        } catch (e) {
            const error = e.response && e.response.data ? e.response.data : e
            errors.push({tessera: iscrizione.tessera, error})
        }
    }
    fs.writeFileSync('iscrizioni-errors.json', JSON.stringify(errors, null, 2))
}

module.exports = importIscrizioni