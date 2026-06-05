import app from './app';
import { getConfig } from './config';
import logger from './utils/logger';

const { port } = getConfig();

app.listen(port, () => {
  logger.info(`TRON Miner API running on port ${port}`, {
    env: getConfig().nodeEnv,
  });
});
