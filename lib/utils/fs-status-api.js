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
      return apiResponse.data;
    } catch (err) {
      logger.error(`getAllInstances: error getting FreeSWITCH instances: ${err.message}`);
      return [];
    }
  }

  static async getAvailableInstances() {
    const fsStatusUrl = `${FS_STATUS_API}/instanceCalls/available`;
    try {
      const apiResponse = await axios.get(
        fsStatusUrl, { headers: {'Authorization': `Bearer ${FS_STATUS_API_KEY}` }}
      );
      return apiResponse.data;
    } catch (err) {
      logger.error(`getAllInstances: error getting FreeSWITCH instances: ${err.message}`);
      return [];
    }
  }

  static async getLeastBusyInstanceUrl() {
    const instances = await this.getAvailableInstances();
    return instances.length > 0 ? instances[0].instanceId : false;
  }

  static async checkInstanceAvailability(baseUrl) {
    try {
      const response = await axios.get(baseUrl);
      const result =  response.status === 200;
      result
        ? logger.info(`checkInstanceAvailability: ${baseUrl} is available`)
        : logger.info(`checkInstanceAvailability: ${baseUrl} is not available`);
      return result;
    } catch (error) {
      logger.error(`checkInstanceAvailability: got error while checking ${baseUrl} availability: ${error}`);
      return false;
    }
  }

  static async deleteInstanceData(instanceId) {
    const fsStatusUrl = `${FS_STATUS_API}/instanceCalls/${instanceId}`;
    try {
      await axios.delete(fsStatusUrl, {'Authorization': `Bearer ${FS_STATUS_API_KEY}` });
      logger.info(`deleteInstanceData:  ${instanceId} data deleted`);
    } catch (error) {
      logger.error(`deleteInstanceData: error deleting instance data: ${error.message}`);
    }
  }
}

module.exports = { FsStatusApiWrapper };
