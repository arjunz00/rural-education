/**
 * Low-Bandwidth optimization middleware:
 * Appends diagnostic headers and measures response payload sizes to encourage
 * minimal JSON payloads for 2G/3G rural networks.
 */
export const bandwidthTracker = (req, res, next) => {
  const start = Date.now();
  res.setHeader('X-Low-Bandwidth-Ready', 'true');
  res.setHeader('X-Compression-Supported', 'gzip,deflate');

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time-Ms', duration.toString());

    if (body) {
      const length = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body));
      res.setHeader('X-Payload-Bytes', length.toString());
    }

    return originalSend.apply(this, arguments);
  };

  next();
};
