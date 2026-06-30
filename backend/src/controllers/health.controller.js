const getHealth = (req, res) => {
  res.json({ data: { status: 'ok' }, meta: { requestId: req.requestId } });
};

module.exports = {
  getHealth
};
