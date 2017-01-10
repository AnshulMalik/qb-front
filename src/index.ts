import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './game/module.ts';

const platform = platformBrowserDynamic();

platform.bootstrapModule(AppModule);