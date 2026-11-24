import { LearningResource } from '../models/LearningResource.js';

export const getResources = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    if (req.query.type) {
      filter.resourceType = req.query.type;
    }

    const resources = await LearningResource.find(filter).sort({ subject: 1, title: 1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const { title, subject, resourceType, description, content, downloadSize, duration, className } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, subject, and description.'
      });
    }

    const resource = await LearningResource.create({
      title,
      subject,
      resourceType: resourceType || 'text',
      description,
      content: content || '',
      downloadSize: downloadSize || '45 KB',
      duration: duration || '4 mins',
      className: className || 'All'
    });

    return res.status(201).json({
      success: true,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};
