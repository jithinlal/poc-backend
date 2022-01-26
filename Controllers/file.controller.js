const { v4 } = require('uuid');
const fs = require('fs');
const sdk = require('node-appwrite');

let client = new sdk.Client();
let storage = new sdk.Storage(client);

client
	.setEndpoint(process.env.APP_WRITE_END_POINT)
	.setProject(process.env.APP_WRITE_PROJECT_ID);

module.exports = {
	upload: async (req, res) => {
		try {
			client.setJWT(req.jwt).setSelfSigned();

			const folderName = req.params.folder;

			if (!req.files) {
				res.send({
					status: false,
					message: 'No file uploaded',
					payload: {},
				});
			} else {
				let file = req.files.file;
				file.mv(`./uploads/${folderName}/${folderName}_${file.name}`);

				const userId = req.currentUser.$id;

				const response = await storage.createFile(
					'unique()',
					fs.createReadStream(
						`./uploads/${folderName}/${folderName}_${file.name}`,
					),
					[`user:${userId}`],
				);

				fs.unlinkSync(`./uploads/${folderName}/${folderName}_${file.name}`);

				res.send({
					status: true,
					message: 'File was uploaded successfully',
					payload: {
						...response,
						name: response.name.slice(response.name.indexOf('_') + 1),
					},
				});
			}
		} catch (error) {
			console.log(error);
			res.status(500).send({
				status: false,
				message: 'Unexpected problem',
				payload: {},
			});
		}
	},
	files: async (req, res) => {
		try {
			client.setJWT(req.jwt).setSelfSigned();

			const folder = req.params.folder;

			const files = await storage.listFiles(folder);

			const formattedFiles = files.files.map((file) => {
				return {
					...file,
					name: file.name.slice(file.name.indexOf('_') + 1),
				};
			});

			res.status(200).json({
				files: formattedFiles,
			});
		} catch (error) {
			console.log(error);
			res.status(500).json({
				message: 'Server error',
			});
		}
	},
};
