var options = {
    source: 'template.pdf',
    output: '',
    sheetBarlagId: '1T8mAeLsIIoxDmCLkllHiDlW80foFqNTC6jC8HB9qvbg',
    sheetPersonalId: '10ZaSuEAhxxuF9lgJPLcbVIk5KugkJCUvSTJFG89KxA4',
    sheetBarlagRange: 'Sheet1!A2:C65',
    sheetPersonalRange: 'Sheet1!A3:G71',
    startDatum: '06-09-2017',
    antalVeckor: 15,
    traffarPerVecka: 1,
    timmarPerTraff: 4
}

// sheets
var fs = require('fs')
var readline = require('readline')
var google = require('googleapis')
var googleAuth = require('google-auth-library')

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/'
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'

fs.readFile('client_secret.json', function (err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err)
        return;
    }
    authorize(JSON.parse(content), writeBarlag)
})

function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret
    var clientId = credentials.installed.client_id
    var redirectUrl = credentials.installed.redirect_uris[0]
    var auth = new googleAuth()
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback)
        } else {
            oauth2Client.credentials = JSON.parse(token)
            callback(oauth2Client)
        }
    })
}

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    })
    console.log('Authorize this app by visiting this url: ', authUrl)
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.question('Eneter the code from that page here: ', function (code) {
        rl.close()
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err)
                return
            }
            oauth2Client.credentials = token
            storeToken(token)
            callback(oauth2Client)
        })
    })
}

function storeToken(token) {
    try {
        fs.mkdir(TOKEN_DIR)
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token))
    console.log('Token stored to ' + TOKEN_PATH)
}

function writeBarlag(auth) {
    // Get Barlags sheet
    var sheets = google.sheets('v4')
    sheets.spreadsheets.values.get({
        auth: auth,
        spreadsheetId: options.sheetBarlagId,
        range: options.sheetBarlagRange
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err)
            return
        }
        var barlagRows = response.values
        if (barlagRows.length == 0) {
            console.log('No data found.')
        } else {
            // Then get Personal Sheet
            sheets.spreadsheets.values.get({
                auth: auth,
                spreadsheetId: options.sheetPersonalId,
                range: options.sheetPersonalRange
            }, function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err)
                    return
                }
                var personalRows = response.values
                if (personalRows.length == 0) {
                    console.log('No data found.')
                } else {
                    // Finally do stuff with them
                    j = -1
                    k = 0
                    barlag = []
                    isNew = false
                    for (var i = 0; i < barlagRows.length; i++) {
                        var row = barlagRows[i]
                        if (row.length <= 1) {
                            j++
                            console.log('Barlag:')
                            isNew = true
                            barlag[j] = {
                                ledare: {},
                                personal: []
                            }
                            k = 0
                        } else if (isNew) {
                            isNew = false
                            console.log('Searching for ' + row[0])
                            barlag[j].ledare = getPersonalData(personalRows, row[0])
                        } else {
                            barlag[j].personal[k] = getPersonalData(personalRows, row[0])
                            k++
                        }
                    }
                    fillForm(barlag)
                }
            })
        }
    })
}

function getPersonalData(rows, name) {
    if (rows.length == 0) {
        console.log('No data found.')
    } else {
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i]

            if (row[0] == name) {
                //console.log('Found ' + row[0])
                return {
                    name: row[0], // Namn
                    mail: row[1], // Mail
                    phone: row[2].charAt(0) !== '0' ? '0' + row[2] : row[2], // Telefon
                    personnr: row[3], // Person NUmmer
                    adress: row[4], // Adress
                    postnum: row[5]  // Postnummer
                }
            }
        }
        console.log('Nothing matched ' + name)
    }
}

// pdf
var pdfFiller = require('pdffiller')

function fillForm(data) {
    for (var i = 0; i < data.length; i++) {
        var source = options.source
        var output = options.output + 'Barlag' + (i+1) + '_Traversen.pdf'

        var barlag = data[i]
        console.log('-- BARLAG NUMMER '+(i+1))
        console.log(JSON.stringify(barlag, null, 2))
        var fields = {
            'Ämne': 'Kassahantering (grp ' + (i+1) + ')',
            'Startdatum': options.startDatum,
            'Arrangör': 'Studentföreningen Campus Skellefteå',
            'Dagar': 'Onsdagar, Fredagar, Lördagar',
            'Lokal': 'Traversen, Campus Skellefteå',
            'Tid': '21:00-01:00',
            'Vad ska ni lära er?': 'Lära sig att servera kunder och hantera en kassaapparat.',
            'Vad ska ni göra?': 'Genom praktiskt arbete och instruktioner från erfarna instruktörer samt kompendium.',
            'Studiematerial': 'Kompendium samt praktisk övning på digitalt kassasystem.',
            'Antal veckor': options.antalVeckor,
            'Antal träffar per vecka': options.traffarPerVecka,
            'Antal timmar per träff': options.timmarPerTraff,
            'Ledare Adress': barlag.ledare.adress || '',
            'Ledare E-mail': barlag.ledare.mail || '',
            'Ledare Namn': barlag.ledare.name || '',
            'Ledare Personnummer': barlag.ledare.personnr || '',
            'Ledare Postadress': barlag.ledare.postnum || '',
            'Ledare Telefon': barlag.ledare.phone || '',
            'Adress 1': barlag.personal[0] ? barlag.personal[0].adress : '',
            'Adress 2': barlag.personal[1] ? barlag.personal[1].adress : '',
            'Adress 3': barlag.personal[2] ? barlag.personal[2].adress : '',
            'Adress 4': barlag.personal[3] ? barlag.personal[3].adress : '',
            'Adress 5': barlag.personal[4] ? barlag.personal[4].adress : '',
            'Adress 6': barlag.personal[5] ? barlag.personal[5].adress : '',
            'Adress 7': barlag.personal[6] ? barlag.personal[6].adress : '',
            'Adress 8': barlag.personal[7] ? barlag.personal[7].adress : '',
            'E-mail 1': barlag.personal[0] ? barlag.personal[0].mail : '',
            'E-mail 2': barlag.personal[1] ? barlag.personal[1].mail : '',
            'E-mail 3': barlag.personal[2] ? barlag.personal[2].mail : '',
            'E-mail 4': barlag.personal[3] ? barlag.personal[3].mail : '',
            'E-mail 5': barlag.personal[4] ? barlag.personal[4].mail : '',
            'E-mail 6': barlag.personal[5] ? barlag.personal[5].mail : '',
            'E-mail 7': barlag.personal[6] ? barlag.personal[6].mail : '',
            'E-mail 8': barlag.personal[7] ? barlag.personal[7].mail : '',
            'Namn 1': barlag.personal[0] ? barlag.personal[0].name : '',
            'Namn 2': barlag.personal[1] ? barlag.personal[1].name : '',
            'Namn 3': barlag.personal[2] ? barlag.personal[2].name : '',
            'Namn 4': barlag.personal[3] ? barlag.personal[3].name : '',
            'Namn 5': barlag.personal[4] ? barlag.personal[4].name : '',
            'Namn 6': barlag.personal[5] ? barlag.personal[5].name : '',
            'Namn 7': barlag.personal[6] ? barlag.personal[6].name : '',
            'Namn 8': barlag.personal[7] ? barlag.personal[7].name : '',
            'Personnummer 1': barlag.personal[0] ? barlag.personal[0].personnr : '',
            'Personnummer 2': barlag.personal[1] ? barlag.personal[1].personnr : '',
            'Personnummer 3': barlag.personal[2] ? barlag.personal[2].personnr : '',
            'Personnummer 4': barlag.personal[3] ? barlag.personal[3].personnr : '',
            'Personnummer 5': barlag.personal[4] ? barlag.personal[4].personnr : '',
            'Personnummer 6': barlag.personal[5] ? barlag.personal[5].personnr : '',
            'Personnummer 7': barlag.personal[6] ? barlag.personal[6].personnr : '',
            'Personnummer 8': barlag.personal[7] ? barlag.personal[7].personnr : '',
            'Personnummer 1:2': /*barlag.personal[0] ? barlag.personal[0].personnr :*/ '',
            'Personnummer 2:2': /*barlag.personal[1] ? barlag.personal[1].personnr :*/ '',
            'Personnummer 3:2': /*barlag.personal[2] ? barlag.personal[2].personnr :*/ '',
            'Personnummer 4:2': /*barlag.personal[3] ? barlag.personal[3].personnr :*/ '',
            'Personnummer 5:2': /*barlag.personal[4] ? barlag.personal[4].personnr :*/ '',
            'Personnummer 6:2': /*barlag.personal[5] ? barlag.personal[5].personnr :*/ '',
            'Personnummer 8:2': /*barlag.personal[7] ? barlag.personal[7].personnr :*/ '',
            'Personnummer 7:2': /*barlag.personal[6] ? barlag.personal[6].personnr :*/ '',
            'Postadress 1': barlag.personal[0] ? barlag.personal[0].postnum : '',
            'Postadress 2': barlag.personal[1] ? barlag.personal[1].postnum : '',
            'Postadress 3': barlag.personal[2] ? barlag.personal[2].postnum : '',
            'Postadress 4': barlag.personal[3] ? barlag.personal[3].postnum : '',
            'Postadress 5': barlag.personal[4] ? barlag.personal[4].postnum : '',
            'Postadress 6': barlag.personal[5] ? barlag.personal[5].postnum : '',
            'Postadress 7': barlag.personal[6] ? barlag.personal[6].postnum : '',
            'Postadress 8': barlag.personal[7] ? barlag.personal[7].postnum : '',
            'Telefon 1': barlag.personal[0] ? barlag.personal[0].phone : '',
            'Telefon 2': barlag.personal[1] ? barlag.personal[1].phone : '',
            'Telefon 3': barlag.personal[2] ? barlag.personal[2].phone : '',
            'Telefon 4': barlag.personal[3] ? barlag.personal[3].phone : '',
            'Telefon 5': barlag.personal[4] ? barlag.personal[4].phone : '',
            'Telefon 6': barlag.personal[5] ? barlag.personal[5].phone : '',
            'Telefon 7': barlag.personal[6] ? barlag.personal[6].phone : '',
            'Telefon 8': barlag.personal[7] ? barlag.personal[7].phone : ''
        }

        console.log(JSON.stringify(fields, null, 2))
        pdfFiller.fillForm(source, output, fields, function (err) {
            if (err) throw err
            console.log('Outputted ' + output)
        })

        /*var nameRegex = null

        pdfFiller.generateFDFTemplate(source, nameRegex, function (err, fdfData) {
            if (err) throw err
            console.log(fdfData)
        })*/
    }
}

/* Format
fillForm('template.pdf', 'output.pdf', {
    startDatum: '06-09-2017',
    antalVeckor: 15,
    traffarPerVecka: 1,
    timmarPerTraff: 4,
    barlag: {
        number: 1
    }
})

Ämne: ""
Startdatum: ""
Arrangör: ""
Dagar: ""
Lokal: ""
Tid: ""
Vad ska ni lära er?: ""
Vad ska ni göra?: ""
Studiematerial: ""
Antal veckor: ""
Antal träffar per vecka: ""
Antal timmar per träff: ""
Ledare Adress: ""
Ledare E-mail: ""
Ledare Namn: ""
Ledare Personnummer: ""
Ledare Postadress: ""
Ledare Telefon: ""
Adress 1: ""
Adress 2: ""
Adress 3: ""
Adress 4: ""
Adress 5: ""
Adress 6: ""
Adress 7: ""
Adress 8: ""
E-mail 1: ""
E-mail 2: ""
E-mail 3: ""
E-mail 4: ""
E-mail 5: ""
E-mail 6: ""
E-mail 7: ""
E-mail 8: ""
Namn 1: ""
Namn 2: ""
Namn 3: ""
Namn 4: ""
Namn 5: ""
Namn 6: ""
Namn 7: ""
Namn 8: ""
Personnummer 1: ""
Personnummer 1:2: ""
Personnummer 2: ""
Personnummer 2:2: ""
Personnummer 3: ""
Personnummer 3:2: ""
Personnummer 4: ""
Personnummer 4:2: ""
Personnummer 5: ""
Personnummer 5:2: ""
Personnummer 6: ""
Personnummer 6:2: ""
Personnummer 7: ""
Personnummer 7:2: ""
Personnummer 8: ""
Personnummer 8:2: ""
Postadress 1: ""
Postadress 2: ""
Postadress 3: ""
Postadress 4: ""
Postadress 5: ""
Postadress 6: ""
Postadress 7: ""
Postadress 8: ""
Telefon 1: ""
Telefon 2: ""
Telefon 3: ""
Telefon 4: ""
Telefon 5: ""
Telefon 6: ""
Telefon 7: ""
Telefon 8: ""
*/