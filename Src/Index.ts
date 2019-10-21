import './Alias';
import { PoCService } from '@Services/PoCService';

const poc = new PoCService();
poc.start().then((e: any) => {
  console.debug(`${e} - POC Started.`);
});
