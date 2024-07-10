const axios = require('axios');
const logger = require('../logger');

const {FS_STATUS_API, FS_STATUS_API_KEY} =  process.env;

class FsStatusApiWrapper {
  static async getAllInstances() {
    const fsStatusUrl = `${FS_STATUS_API}/instanceCalls`;
    try {
      const apiResponse = await axios.get(
        fsStatusUrl, { headers: {'Authorization': `Bearer ${FS_STATUS_API_KEY}` }}
      );
      const instances = apiResponse.data;
      if (instances.length > 0) {
        return instances[0].instanceId;
      }
      return false;
    } catch (err) {
      logger.error(`getAllInstances: error getting FreeSWITCH instances: ${err.message}`);
    }
  }
}

module.exports = { FsStatusApiWrapper };
