exports.role = function (req, res) {
res.header("Cache-Control", "no-cache, no-store, must-revalidate");

	if (req.user) {
		res.send(req.user.role);
	} else {
		res.send('guest');
	}
};
