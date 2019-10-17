import './Alias';
import { PoCService } from '@services/PoCService';

const poc = new PoCService();
poc.start().then((e) => {
  console.debug('POC Started.');
});
