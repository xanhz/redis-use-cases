import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet, ServiceAccountCredentials } from 'google-spreadsheet';
import { OnApplicationBootstrap } from '../core/interfaces';

export interface GoogleSheetServiceOptions {
  docID: string;
  credentials: ServiceAccountCredentials;
}

export class GoogleSheetService implements OnApplicationBootstrap {
  public readonly docID: string;
  private readonly credentials: ServiceAccountCredentials;
  private readonly doc: GoogleSpreadsheet;
  private sheet!: GoogleSpreadsheetWorksheet;

  constructor(options: GoogleSheetServiceOptions) {
    const { credentials, docID } = options;
    this.docID = docID;
    this.credentials = credentials;
    this.doc = new GoogleSpreadsheet(docID);
  }

  public async onBootstrap(): Promise<any> {
    await this.doc.useServiceAccountAuth(this.credentials);
    await this.doc.loadInfo();
    const demoSheet = this.doc.sheetsByTitle['demo'];
    if (demoSheet) {
      this.sheet = demoSheet;
    } else {
      this.sheet = await this.doc.addSheet({
        title: 'demo',
        headerValues: ['name'],
      });
    }
  }

  public addRow(row: any) {
    return this.sheet.addRow(row);
  }
}
