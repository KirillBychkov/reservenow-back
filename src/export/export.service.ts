import * as xlsx from 'xlsx';
import * as tmp from 'tmp';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportService {
  async exportAsExcel(data: unknown[], filename: string): Promise<string> {
    const ws = xlsx.utils.json_to_sheet(data);

    const workBook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workBook, ws, filename);

    return new Promise((resolve, reject) => {
      tmp.file(
        { discardDescriptor: true, mode: 0o644, prefix: filename, postfix: '.xlsx' },
        (err, file) => {
          if (err) reject(err);

          xlsx.writeFile(workBook, file);

          resolve(file);
        },
      );
    });
  }
}
