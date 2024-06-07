const assert = require('assert');
const mysql = require('mysql2/promise');
const logger = require('pino')();

logger.info('Creating IVR app data...');

assert.ok(process.env.JAMBONES_MYSQL_HOST, 'missing env JAMBONES_MYSQL_HOST');
assert.ok(process.env.JAMBONES_MYSQL_DATABASE, 'missing env JAMBONES_MYSQL_DATABASE');
assert.ok(process.env.JAMBONES_MYSQL_PASSWORD, 'missing env JAMBONES_MYSQL_PASSWORD');
assert.ok(process.env.JAMBONES_MYSQL_USER, 'missing env JAMBONES_MYSQL_USER');

assert.ok(process.env.JAMBONES_SIP_DOMAIN, 'missing env JAMBONES_SIP_DOMAIN');
assert.ok(process.env.BASE_IVR_APP_URL, 'missing env BASE_IVR_APP_URL');
// 'x012y987-a123-b234-c345-d456e567f678'
assert.ok(process.env.JAMBONES_ACCOUNT_SID, 'missing env JAMBONES_ACCOUNT_SID');
// '55123cc2-3456-4d56-88ac-2aa4f0fd93a9'
assert.ok(process.env.JAMBONES_APPLICATION_SID, 'missing env JAMBONES_APPLICATION_SID');
// '3d9108c8-166e-4473-bebd-8a99e94a12a6'
assert.ok(process.env.JAMBONES_API_KEY, 'missing env JAMBONES_API_KEY');

const opts = {
  host: process.env.JAMBONES_MYSQL_HOST,
  user: process.env.JAMBONES_MYSQL_USER,
  password: process.env.JAMBONES_MYSQL_PASSWORD,
  database: process.env.JAMBONES_MYSQL_DATABASE,
  port: process.env.JAMBONES_MYSQL_PORT || 3306,
  multipleStatements: true,
};

const accountData = {
  sid: process.env.JAMBONES_ACCOUNT_SID,
  name: 'main',
  sipRealm: process.env.JAMBONES_SIP_DOMAIN,
  serviceProviderSid: '2708b1b3-2736-40ea-b502-c53d8396247f',
  planType: 'free',
  webhookSecret: 'wh_secret_ThvxQf7dHFRqjFxwL63SGs'
};

const callHookData = {
  sid: '8mmfasf8-0123-4567-a16b-12a5nn830001',
  url: `${process.env.BASE_IVR_APP_URL}/ivr-callback`,
  method: 'POST',
};

const callStatusHookData = {
  sid: '8mmfasf8-0123-4567-a16b-12a5nn830002',
  url: `${process.env.BASE_IVR_APP_URL}/status-callback`,
  method: 'POST',
};

const applicationData = {
  sid: process.env.JAMBONES_APPLICATION_SID,
  name: 'IVR',
  accountSid: accountData.sid,
  call_hook_sid: callHookData.sid,
  call_status_hook_sid: callStatusHookData.sid,
};

const apiKeyData = {
  sid: '3958447b-b68d-4ef4-9c5f-5a11g6v552314',
  token: process.env.JAMBONES_API_KEY,
  accountSid: accountData.sid,
};


const newAccountSql =
    `insert into accounts (account_sid, name, sip_realm, service_provider_sid, plan_type, webhook_secret) 
    values (
        ${accountData.sid},
        ${accountData.name},
        ${accountData.sipRealm},
        ${accountData.serviceProviderSid},
        ${accountData.planType},
        ${accountData.webhookSecret},
    );`;

const newCallHookSql =
    `insert into webhooks (webhook_sid, url, method) 
    values (${callHookData.sid}, ${callHookData.url}, ${callHookData.method});`;

const newCallStatusHookSql =
    `insert into webhooks (webhook_sid, url, method) 
    values (${callStatusHookData.sid}, ${callStatusHookData.url}, ${callStatusHookData.method});`;

const newApplicationSql =
    `insert into applications (application_sid, name, account_sid, call_hook_sid, call_status_hook_sid) 
    values 
        (
            ${applicationData.sid},
            ${applicationData.name},
            ${applicationData.accountSid},
            ${applicationData.callHookSid},
            ${applicationData.callStatusHookSid}
        );`;

const newApiKeySql = `insert into api_keys (api_key_sid, token, account_sid) 
    values (${apiKeyData.sid}, ${apiKeyData.token}, ${apiKeyData.accountSid});`;

const doIt = async() => {
  let connection;
  try {
    logger.info({opts}, 'connecting to mysql database..');
    connection = await mysql.createConnection(opts);
  } catch (err) {
    logger.error({err}, 'Error connecting to database with provided env vars');
    process.exit(1);
  }

  await connection.execute(newAccountSql);
  await connection.execute(newCallHookSql);
  await connection.execute(newCallStatusHookSql);
  await connection.execute(newApplicationSql);
  await connection.execute(newApiKeySql);

  await connection.end();
  logger.info('IVR app data created successfully');
};

doIt();
