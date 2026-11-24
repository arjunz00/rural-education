import { LearningResource } from '../models/LearningResource.js';

export const getResources = async (req, res, next) => {
  try {
    const filter = {};

    // Filter by Class Level (Class 1-10 or All)
    const targetClass = req.query.class || req.query.classLevel || req.query.className;
    if (targetClass && targetClass !== 'All' && targetClass !== 'all') {
      const cleanClass = targetClass.toString().replace(/class\s*/i, '').trim();
      filter.$or = [
        { classLevel: cleanClass },
        { classLevel: 'all' },
        { className: cleanClass },
        { className: 'all' },
        { className: 'All' }
      ];
    }

    // Filter by Subject
    if (req.query.subject && req.query.subject !== 'All') {
      filter.subject = { $regex: new RegExp(`^${req.query.subject.trim()}$`, 'i') };
    }

    // Filter by Resource Format (audio, text, video)
    const targetFormat = req.query.format || req.query.type;
    if (targetFormat && targetFormat !== 'All') {
      filter.resourceType = targetFormat.toLowerCase().trim();
    }

    const resources = await LearningResource.find(filter).sort({ classLevel: 1, subject: 1, title: 1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
      appliedFilters: {
        class: targetClass || 'All',
        subject: req.query.subject || 'All',
        format: targetFormat || 'All'
      }
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
      classLevel,
      className
    } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, subject, and description.'
      });
    }

    const effectiveClass = (classLevel || className || 'all').toString().replace(/class\s*/i, '').trim().toLowerCase();

    const resource = await LearningResource.create({
      title,
      subject,
      resourceType: resourceType || 'text',
      description,
      content: content || '',
      downloadSize: downloadSize || '45 KB',
      duration: duration || '—',
      classLevel: effectiveClass || 'all',
      className: effectiveClass || 'all'
    });

    return res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};
