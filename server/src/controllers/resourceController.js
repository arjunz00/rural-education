import { LearningResource } from '../models/LearningResource.js';

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

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
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
      classLevel: effectiveClass,
      className: String(effectiveClass)
    });

    return res.status(201).json({
      success: true,
      data: resource
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
    return res.status(200).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};
