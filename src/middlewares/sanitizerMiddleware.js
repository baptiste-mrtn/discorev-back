const convertUndefinedToNull = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertUndefinedToNull);
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj[key] === undefined) {
        obj[key] = null;
      } else if (typeof obj[key] === 'object') {
        obj[key] = convertUndefinedToNull(obj[key]);
      }
    }
  }
  return obj;
};

const sanitizeRequest = (req, res, next) => {
  req.body = convertUndefinedToNull(req.body);
  req.query = convertUndefinedToNull(req.query);
  req.params = convertUndefinedToNull(req.params);
  next();
};

export default sanitizeRequest;
