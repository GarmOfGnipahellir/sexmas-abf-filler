# Sexmästeerit's ABF Arbetsplans Filler
At the top of index.js there's some options for adapting this to other sheets.

```js
// index.js
var options = {
    source: 'template.pdf', // the pdf to use (don't change unless you know what you're doing)
    output: '', // path to the output folder (fine to leave empty)
    sheetBarlagId: '1T8mAeLsIIoxDmCLkllHiDlW80foFqNTC6jC8HB9qvbg', // sheet with barlag members
    sheetPersonalId: '10ZaSuEAhxxuF9lgJPLcbVIk5KugkJCUvSTJFG89KxA4', // sheet with personal info
    sheetBarlagRange: 'Sheet1!A2:C65', // in which range are all names (excluding header)
    sheetPersonalRange: 'Sheet1!A3:G71', // in which range are namn, mail, telefon, personnr, adress, postnr (excluding header, in that order)
    startDatum: '06-09-2017',
    antalVeckor: 15,
    traffarPerVecka: 1,
    timmarPerTraff: 4
}
```