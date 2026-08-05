import { dbService } from '../services/dbService.js';

export const getHolidays = async (req, res, next) => {
  try {
    const holidays = await dbService.getAllHolidays();
    res.status(200).json({
      success: true,
      data: holidays,
      count: holidays.length
    });
  } catch (error) {
    next(error);
  }
};

export const createHoliday = async (req, res, next) => {
  try {
    const { holiday_name, holiday_date, description } = req.body;

    if (!holiday_name || !holiday_date) {
      return res.status(400).json({
        success: false,
        message: 'Holiday name and date are required.'
      });
    }

    const newHoliday = await dbService.createHoliday({
      holiday_name: holiday_name.trim(),
      holiday_date,
      description: description ? description.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Government holiday added successfully.',
      data: newHoliday
    });
  } catch (error) {
    next(error);
  }
};

export const updateHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { holiday_name, holiday_date, description } = req.body;

    const existing = await dbService.getHolidayById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found.'
      });
    }

    const updated = await dbService.updateHoliday(id, {
      holiday_name: holiday_name !== undefined ? holiday_name.trim() : existing.holiday_name,
      holiday_date: holiday_date || existing.holiday_date,
      description: description !== undefined ? description.trim() : existing.description
    });

    res.status(200).json({
      success: true,
      message: 'Government holiday updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getHolidayById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found.'
      });
    }

    await dbService.deleteHoliday(id);
    res.status(200).json({
      success: true,
      message: 'Government holiday deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
