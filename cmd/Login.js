
function Login(credential) {
	//TO-DO
	if (credential) {
		this.name = credential.name;
	}
	return this.id;
}

module.exports = Login;
