import { Injectable } from '@nestjs/common';
import { span } from '@zonneplan/open-telemetry-node';

@Injectable()
export class AppService {
  @span()
  getData(date: Date, name: string): {
    message: string
  } {
    return { message: `Hello ${name}, today is ${date.toDateString()}` };
  }
}
