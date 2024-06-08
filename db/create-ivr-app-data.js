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

// eslint-disable-next-line max-len
const mainUserPassword = '$argon2i$v=19$m=65536,t=3,p=4$WvsgfsGZfPMiPHFwjo3eVHLDUNrvqIqhNznmKi/o+C4$O/AXrx21b/KQKSEeq0aW1+6PNSwi1fAOTNYsNZD6zmw';
// mainUserPassword = yiYJ#Zp7VJpGz!JNRbLv

// eslint-disable-next-line max-len
const adminUserPassword = '$argon2i$v=19$m=65536,t=3,p=4$8TPCfVA/fEos66jx8GP95gAzTF3fL9r8Fi/VamcGeww$MZ1xb9LUaRvlBOv9hSn6j6jzH3z6WxsjTI8wAwoQrl4';
// adminUserPassword = k5NS4qnm9pzKxewQQvit

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
  callHookSid: callHookData.sid,
  callStatusHookSid: callStatusHookData.sid,
};

const apiKeyData = {
  sid: '3958447b-b68d-4ef4-9c5f-5a11g6v552314',
  token: process.env.JAMBONES_API_KEY,
  accountSid: accountData.sid,
};

const mainUserData = {
  sid: 'c9ac00d1-34f3-426c-a44e-09be2cb526da',
  name: 'main',
  email: 'main@domain.com',
  hashedPassword: mainUserPassword,
  accountSid: accountData.sid,
  serviceProviderSid: accountData.serviceProviderSid,
};

const adminUserData = {
  sid: '12c80508-edf9-4b22-8d09-55abd02648eb',
  name: 'admin',
  email: 'admin@domain.com',
  hashedPassword: adminUserPassword,
};

// eslint-disable-next-line max-len
const newAccountSql = `insert ignore into accounts (account_sid, name, sip_realm, service_provider_sid, plan_type, webhook_secret) values ('${accountData.sid}','${accountData.name}','${accountData.sipRealm}','${accountData.serviceProviderSid}','${accountData.planType}','${accountData.webhookSecret}');`;

// eslint-disable-next-line max-len
const newCallHookSql = `insert ignore into webhooks (webhook_sid, url, method) values ('${callHookData.sid}', '${callHookData.url}', '${callHookData.method}');`;

// eslint-disable-next-line max-len
const newCallStatusHookSql = `insert ignore into webhooks (webhook_sid, url, method) values ('${callStatusHookData.sid}', '${callStatusHookData.url}', '${callStatusHookData.method}');`;

// eslint-disable-next-line max-len
const newApplicationSql = `insert ignore into applications (application_sid, name, account_sid, call_hook_sid, call_status_hook_sid) values ('${applicationData.sid}','${applicationData.name}','${applicationData.accountSid}','${applicationData.callHookSid}','${applicationData.callStatusHookSid}');`;

// eslint-disable-next-line max-len
const newApiKeySql = `insert ignore into api_keys (api_key_sid, token, account_sid) values ('${apiKeyData.sid}', '${apiKeyData.token}', '${apiKeyData.accountSid}');`;

// eslint-disable-next-line max-len
const mainUserSql = `insert ignore into users (user_sid, name, email, hashed_password, account_sid, service_provider_sid) values ('${mainUserData.sid}','${mainUserData.name}','${mainUserData.email}','${mainUserData.hashedPassword}','${mainUserData.accountSid}','${mainUserData.serviceProviderSid}');`;

// eslint-disable-next-line max-len
const adminUserSql = `insert ignore into users (user_sid, name, email, hashed_password) values ('${adminUserData.sid}','${adminUserData.name}','${adminUserData.email}','${adminUserData.hashedPassword}');`;

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

  await connection.execute(mainUserSql);
  await connection.execute(adminUserSql);

  await connection.end();
  logger.info('IVR app data created successfully');
};

doIt();
