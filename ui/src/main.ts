import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

const ogFetch = window.fetch;
window.fetch = async (...args) => {
  console.log(args);
  return await ogFetch(...args);
};
