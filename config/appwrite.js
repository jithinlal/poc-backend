const sdk = require('node-appwrite');

let client = new sdk.Client();
let storage = new sdk.Storage(client);

client
	.setEndpoint(process.env.APP_WRITE_END_POINT)
	.setProject(process.env.APP_WRITE_PROJECT_ID)
	.setKey(process.env.APP_WRITE_KEY)
	.setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

module.exports = {
	storage,
};
