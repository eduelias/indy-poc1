import './Alias';
import { PoCService } from '@Services/PoCService';

const poc = new PoCService();
poc.start().then(() => {
  console.debug(`POC Started.`);
});
