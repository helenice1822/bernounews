module.exports = async (req, res) => {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  const sent = (req.body && req.body.password) || "";
  const serverPw = process.env.ADMIN_PASSWORD || "helena2025";
  if (sent && sent === serverPw) return res.status(200).send(JSON.stringify({ ok:true }));
  return res.status(401).send(JSON.stringify({ ok:false }));
};
