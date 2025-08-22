// Minimal no-op module used to satisfy resolver aliases for devtools.
exports.initialize = function () {};
exports.connectToDevTools = function () {};
exports.connectWithCustomMessagingProtocol = function () {
  return function () {};
};
// Empty module shim used to prevent Metro from bundling react-devtools-core
// Export the minimal API RN expects so calls like initialize(...) won't throw.
module.exports = {
	initialize: function () {},
	connectToDevTools: function () {},
	connectWithCustomMessagingProtocol: function () {
		return function () {
			return { disconnect: function () {} };
		};
	},
};
