import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getData() {
    const date = new Date();
    const name = 'nest';

    return this.appService.getData(date, name);
  }
}
