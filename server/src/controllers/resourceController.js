import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LearningResource } from '../models/LearningResource.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIO_DIR = path.resolve(__dirname, '../../public/audio');

/**
 * Generates a valid, lightweight PCM 16-bit WAV audio buffer dynamically
 * for procedural fallback when physical files are unavailable.
 */
export function generateChimeBuffer(text = '') {
  const sampleRate = 22050;
  const durationSeconds = 3;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // Audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // Bits per sample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Synthesize pleasant acoustic chime harmonics: 440 Hz (A4), 554.37 Hz (C#5), 659.25 Hz (E5)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-1.5 * (t % 1.0)); // Repeating soft chime per second
    const noteFreq = t < 1.0 ? 440 : t < 2.0 ? 554.37 : 659.25;
    const sampleVal = Math.sin(2 * Math.PI * noteFreq * t) * 0.6 +
                      Math.sin(2 * Math.PI * (noteFreq * 2) * t) * 0.2;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sampleVal * envelope * 24000)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Resolves static audio file from server/public/audio/ for a given learning resource.
 */
export const getPhysicalAudioPath = (resource) => {
  if (!fs.existsSync(AUDIO_DIR)) return null;

  const classLevel = Number(resource.classLevel);

  const candidateBases = [];
  if (classLevel === 1) candidateBases.push('class1_phonics_alphabet');
  if (classLevel === 2) candidateBases.push('class2_english_rhymes');
  if (classLevel === 4) candidateBases.push('class4_math_tables');
  if (classLevel === 6) candidateBases.push('class6_science_earth');
  if (classLevel === 7) candidateBases.push('class7_science_nutrition');
  if (classLevel === 8) candidateBases.push('class8_english_reading');
  if (classLevel === 9) candidateBases.push('class9_civics_panchayat');
  if (classLevel === 10) candidateBases.push('class10_english_grammar');

  candidateBases.push(`class${classLevel}`);

  for (const base of candidateBases) {
    const mp3 = path.join(AUDIO_DIR, `${base}.mp3`);
    if (fs.existsSync(mp3)) return mp3;
    const wav = path.join(AUDIO_DIR, `${base}.wav`);
    if (fs.existsSync(wav)) return wav;
  }

  // Fallback to any existing audio file in directory if present
  try {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
    if (files.length > 0) {
      return path.join(AUDIO_DIR, files[0]);
    }
  } catch (err) {
    // ignore
  }

  return null;
};

export const getResources = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by Class Level (Strict isolation for requested class)
    const targetClass = req.query.classLevel || req.query.class || req.query.className;
    if (targetClass && targetClass !== 'All' && targetClass !== 'all') {
      const cleanClass = targetClass.toString().replace(/class\s*/i, '').trim();
      const numClass = Number(cleanClass);
      if (!isNaN(numClass)) {
        filter.classLevel = numClass;
      } else {
        filter.classLevel = cleanClass;
      }
    }

    // Filter by Subject
    if (req.query.subject && req.query.subject !== 'All') {
      filter.subject = { $regex: new RegExp(`^${req.query.subject.trim()}$`, 'i') };
    }

    // Filter by Resource Format (audio, text, video)
    const targetFormat = req.query.resourceType || req.query.format || req.query.type;
    if (targetFormat && targetFormat !== 'All') {
      filter.resourceType = targetFormat.toLowerCase().trim();
    }

    const resources = await LearningResource.find(filter).sort({ classLevel: 1, subject: 1, title: 1 });

    const enrichedResources = resources.map((r) => {
      const doc = r.toObject ? r.toObject() : { ...r };
      if (doc.resourceType === 'audio') {
        doc.audioUrl = `/api/resources/${doc._id}/audio`;
        doc.downloadUrl = `/api/resources/${doc._id}/download`;
      }
      return doc;
    });

    return res.status(200).json({
      success: true,
      count: enrichedResources.length,
      data: enrichedResources,
      appliedFilters: {
        classLevel: targetClass || 'All',
        subject: req.query.subject || 'All',
        format: targetFormat || 'All'
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Learning resource not found.'
      });
    }

    const doc = resource.toObject ? resource.toObject() : { ...resource };
    if (doc.resourceType === 'audio') {
      doc.audioUrl = `/api/resources/${doc._id}/audio`;
      doc.downloadUrl = `/api/resources/${doc._id}/download`;
    }

    return res.status(200).json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      resourceType,
      description,
      content,
      downloadSize,
      duration,
      durationSeconds,
      classLevel,
      className
    } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, subject, and description.'
      });
    }

    const rawClass = classLevel !== undefined ? classLevel : className;
    const effectiveClass = Number(rawClass) || 1;

    const resource = await LearningResource.create({
      title: title.trim(),
      subject: subject.trim(),
      resourceType: resourceType || 'text',
      description: description.trim(),
      content: content || '',
      downloadSize: downloadSize || '25 KB',
      duration: duration || '—',
      durationSeconds: durationSeconds || 180,
      classLevel: effectiveClass,
      className: String(effectiveClass)
    });

    const doc = resource.toObject ? resource.toObject() : { ...resource };
    if (doc.resourceType === 'audio') {
      doc.audioUrl = `/api/resources/${doc._id}/audio`;
      doc.downloadUrl = `/api/resources/${doc._id}/download`;
    }

    return res.status(201).json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Dedicated Byte-Range Audio Streaming Route (GET /api/resources/:id/audio)
 * Supports HTTP 206 Partial Content for scrubbing without loading entire file.
 */
export const streamResourceAudio = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Learning resource not found.'
      });
    }

    const filePath = getPhysicalAudioPath(resource);

    if (filePath && fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      const isMp3 = filePath.endsWith('.mp3');
      const contentType = isMp3 ? 'audio/mpeg' : 'audio/wav';

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).set('Content-Range', `bytes */${fileSize}`);
          return res.end();
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400'
        });

        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400'
        });

        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      // Dynamic synthesis fallback (lightweight WAV chime buffer)
      const buffer = generateChimeBuffer(resource.content || resource.title);
      const bufferSize = buffer.length;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : bufferSize - 1;

        if (start >= bufferSize) {
          res.status(416).set('Content-Range', `bytes */${bufferSize}`);
          return res.end();
        }

        const chunk = buffer.subarray(start, end + 1);

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${bufferSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.length,
          'Content-Type': 'audio/wav',
          'Cache-Control': 'public, max-age=86400'
        });

        return res.end(chunk);
      } else {
        res.writeHead(200, {
          'Content-Length': bufferSize,
          'Content-Type': 'audio/wav',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400'
        });

        return res.end(buffer);
      }
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Dedicated Forced File Download Route (GET /api/resources/:id/download)
 * Sets attachment headers to trigger native browser saving for offline playback.
 */
export const downloadResourceAudio = async (req, res, next) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Learning resource not found.'
      });
    }

    const safeTitle = (resource.title || 'Lesson').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `GramShiksha-Class${resource.classLevel}-${resource.subject}-${safeTitle}.mp3`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const filePath = getPhysicalAudioPath(resource);

    if (filePath && fs.existsSync(filePath)) {
      const isMp3 = filePath.endsWith('.mp3');
      const contentType = isMp3 ? 'audio/mpeg' : 'audio/wav';
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
    } else {
      const buffer = generateChimeBuffer(resource.content || resource.title);
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Length', buffer.length);
      return res.end(buffer);
    }
  } catch (err) {
    next(err);
  }
};
