import { Request } from 'express';
import { Controller, Post } from '../core';
import { GoogleSheetService, RedlockService } from '../services';

@Controller('google-sheets')
export class GoogleSheetController {
  constructor(
    private readonly redlock: RedlockService,
    private readonly googleSheet: GoogleSheetService
  ) {}

  @Post('without-locker')
  public async writeSheetWithoutRedlock(req: Request) {
    const { body } = req;
    await this.googleSheet.addRow(body);
    return {
      message: 'OK',
    };
  }

  @Post('with-locker')
  public async writeSheetWithRedlock(req: Request) {
    const locker = await this.redlock.acquire(['write-google-sheet'], 5000);
    console.log(`[GOOGLE_SHEET_CONTROLLER]: Lock acquire`);
    try {
      const { body } = req;
      await this.googleSheet.addRow(body);
      return {
        message: 'OK',
      };
    } finally {
      locker.release().catch(_ => {});
    }
  }
}
