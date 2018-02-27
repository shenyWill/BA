const Path = require('path');
const Router = require('./router.js');
const Var = require('./varPath.js');
var entry = {};
for(var page in Router){
	
	entry[page] = Router[page].entry;
}


module.exports = entry;
