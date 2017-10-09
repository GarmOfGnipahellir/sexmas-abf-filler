import * as pdfFiller from 'pdffiller';

var templatePDF: string = '../assets/template.pdf'

var barlag: Array<string[]>;

export default function writePDF(data: any) {
  var currentBarlag: string[];
  data.barlag.forEach((row: string[]) => {
    if (row.length <= 1) {
      if (currentBarlag.length > 0) {
        barlag.push(currentBarlag);
      }
      currentBarlag = [];
    } else if (row[0] == 'Reserver') {
      barlag.push(currentBarlag);
      return;
    } else {
      currentBarlag.push(row[0]);
    }
  });

  console.log(barlag);
}