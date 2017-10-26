/*!
 * Keyfile Check (v1.0.0.20171027), http://tpkn.me/
 */

const fs = require('fs');
const path = require('path');
const request = require('request');
const mac = require('node-machine-id').machineIdSync;
const EventEmitter = require('events').EventEmitter;

class KeyfileCheck extends EventEmitter {
	constructor(){
		super();
	}

	check(cfg){
		if(typeof cfg === 'undefined') return this.emit('fail', {message: 'No config object!'});
		if(cfg && !cfg.key) return this.emit('fail', {message: 'No keyfile!'});
		if(cfg && !cfg.server) return this.emit('fail', {message: 'No server url!'});

		let keyfile = cfg.key;
		let keyfile_name = path.basename(keyfile);
		let check_url = cfg.server;
		let uid = cfg && cfg.uid ? cfg.uid : '';

		this.emit('checking', {message: 'Checking keyfile...', keyfile: keyfile_name, mac: mac, uid: uid});
	
		if(fs.existsSync(keyfile)){
			this.emit('key', {message: 'Keyfile exist', keyfile: keyfile_name, mac: mac, uid: uid});

			fs.readFile(keyfile, 'utf8', (err, key_data) => {
				if(err) return this.emit('fail', {message: 'Can\'t read keyfile: ' + keyfile, keyfile: keyfile_name, mac: mac, uid: uid});

				request.post({url: check_url, formData: {key: key_data, keyfile: keyfile_name, mac: mac()}}, (err, httpResponse, body) => {
					if(err) return this.emit('fail', {message: 'Server does not respond: ' + check_url, keyfile: keyfile_name, mac: mac, uid: uid});
					
					try {
						let answer = JSON.parse(body);
						if(answer.status == 'valid'){
							this.emit('success', {message: 'Key is valid!', keyfile: keyfile_name, mac: mac, uid: uid});
						}else{
							this.emit('fail', {message: 'Invalid key', keyfile: keyfile_name, mac: mac, uid: uid});
						}
					}catch(e){
						this.emit('fail', {message: 'Bad server response', keyfile: keyfile_name, mac: mac, uid: uid});
					}
				});
			});
		}else{
			this.emit('fail', {message: 'Keyfile does not exist', keyfile: keyfile_name, mac: mac, uid: uid});
		}
	}
}

module.exports = new KeyfileCheck;