function auth(user, pass) { // Create basic authentication header for authorization
    let buff = new Buffer.from(`${user}:${pass}`);
    let b64 = buff.toString('base64');
    return `Basic ${b64}`;
}

module.exports = auth;